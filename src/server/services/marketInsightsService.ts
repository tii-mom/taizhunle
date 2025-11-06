import { createHash } from 'node:crypto';
import type { Request } from 'express';

import { cacheGetHash, cacheGetZSet, cacheSetHash, cacheSetZSet } from '../lib/cache.js';
import { summarizeContent } from '../lib/llm.js';
import { fetchRssArticles } from '../lib/rss.js';
import { computeSimhash, isSimilar } from '../lib/simhash.js';
import { searchTweets } from '../lib/twitter.js';
import { config } from '../../config/env.js';
import { getSupabaseClient } from './supabaseClient.js';
import type { BetRow, PredictionRow } from '../types/database.js';

export type HotTopicTemplate = {
  title: string;
  summary: string;
  referenceUrl: string;
};

export type HotTopic = {
  id: string;
  title: string;
  tags: string[];
  heat: number;
  template: HotTopicTemplate;
};

export type MarketNewsItem = {
  id: string;
  marketId: string;
  source: string;
  sourceType: 'media' | 'social' | 'report';
  publishedAt: string;
  summary: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
};

export type HotTopicQuery = {
  tag?: string;
  limit?: number;
};

type AdminNotes = {
  tags?: string[];
  referenceUrl?: string;
  referenceSummary?: string;
  templateTitle?: string;
};

type PredictionStat = {
  prediction: PredictionRow;
  deltaPool: number;
  deltaUsers: number;
  tags: string[];
  referenceUrl: string;
  referenceSummary: string;
  templateTitle: string;
};

type RawNewsItem = {
  id: string;
  source: string;
  sourceType: MarketNewsItem['sourceType'];
  title: string;
  content: string;
  url: string;
  publishedAt: string;
};

const HOT_TOPICS_KEY = 'insights:hot-topics:v1';
const HOT_TOPICS_CACHE_SIZE = 50;
const HOT_TOPICS_TTL = Math.max(60, config.insights.hotTopicsTtl ?? 3600);
const NEWS_TTL = Math.max(600, config.insights.newsTtl ?? 6 * 3600);

const RSS_FEEDS = [
  { url: 'https://www.espn.com/espn/rss/news', tags: ['sports', 'football', 'basketball'] },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', tags: ['macro', 'politics', 'world'] },
  { url: 'https://rss.sina.com.cn/news/gnxw/gdxw1.xml', tags: ['macro', 'china', 'politics'] },
];

let hotTopicRefreshPromise: Promise<HotTopic[]> | null = null;

function sanitiseLimit(value: number | undefined, fallback = 10): number {
  if (!Number.isFinite(value ?? NaN)) {
    return fallback;
  }
  return Math.min(Math.max(Math.trunc(value ?? fallback), 1), 20);
}

function normaliseTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function parseAdminNotes(notes: string | null): AdminNotes {
  if (!notes) {
    return {};
  }
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === 'object') {
      return parsed as AdminNotes;
    }
  } catch {
    // ignore
  }
  return {};
}

function numeric(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildHotTopic(stat: PredictionStat, weight: number): HotTopic {
  const summarySource = stat.referenceSummary || stat.prediction.description || '';
  const summary = summarySource.length > 240 ? `${summarySource.slice(0, 237)}...` : summarySource;

  return {
    id: stat.prediction.id,
    title: stat.prediction.title,
    tags: stat.tags,
    heat: Number(weight.toFixed(4)),
    template: {
      title: stat.templateTitle || stat.prediction.title,
      summary,
      referenceUrl: stat.referenceUrl,
    },
  } satisfies HotTopic;
}

function computeHeatScores(stats: PredictionStat[]): HotTopic[] {
  if (stats.length === 0) {
    return [];
  }

  const maxPool = Math.max(...stats.map((stat) => stat.deltaPool), 0) || 1;
  const maxUsers = Math.max(...stats.map((stat) => stat.deltaUsers), 0) || 1;

  return stats
    .map((stat) => {
      const poolScore = stat.deltaPool > 0 ? stat.deltaPool / maxPool : 0;
      const userScore = stat.deltaUsers > 0 ? stat.deltaUsers / maxUsers : 0;
      const combined = Math.min(1, Math.max(0, 0.7 * poolScore + 0.3 * userScore));
      return buildHotTopic(stat, combined);
    })
    .sort((a, b) => b.heat - a.heat);
}

async function fetchActivePredictions(): Promise<PredictionRow[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('predictions')
      .select('id,title,description,admin_notes,total_pool,yes_pool,no_pool,status,created_at,updated_at,tags,reference_url')
      .in('status', ['active', 'approved'])
      .order('updated_at', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('Failed to load predictions for hot topics:', error.message);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.warn('Unexpected error when loading predictions for hot topics:', error);
    return [];
  }
}

async function fetchRecentBets(since: string): Promise<Array<Pick<BetRow, 'prediction_id' | 'user_id' | 'amount'>>> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('bets')
      .select('prediction_id,user_id,amount')
      .gte('created_at', since)
      .not('status', 'eq', 'refunded')
      .limit(5000);

    if (error) {
      console.warn('Failed to load recent bets for hot topics:', error.message);
      return [];
    }

    return data as Array<Pick<BetRow, 'prediction_id' | 'user_id' | 'amount'>> ?? [];
  } catch (error) {
    console.warn('Unexpected error when loading bets for hot topics:', error);
    return [];
  }
}

function buildPredictionStats(
  predictions: PredictionRow[],
  bets: Array<Pick<BetRow, 'prediction_id' | 'user_id' | 'amount'>>,
): PredictionStat[] {
  const betsByPrediction = new Map<string, { pool: number; users: Set<string> }>();
  for (const bet of bets) {
    const entry = betsByPrediction.get(bet.prediction_id) ?? { pool: 0, users: new Set<string>() };
    entry.pool += numeric(bet.amount);
    if (bet.user_id) {
      entry.users.add(String(bet.user_id));
    }
    betsByPrediction.set(bet.prediction_id, entry);
  }

  return predictions.map((prediction) => {
    const adminNotes = parseAdminNotes(prediction.admin_notes);
    const dbTags = Array.isArray(prediction.tags)
      ? prediction.tags.map((tag) => String(tag)).filter(Boolean)
      : [];
    const tags = dbTags.length > 0
      ? dbTags
      : Array.isArray(adminNotes.tags)
        ? adminNotes.tags.map((tag) => String(tag)).filter(Boolean)
        : [];

    const entry = betsByPrediction.get(prediction.id);
    return {
      prediction,
      deltaPool: entry ? entry.pool : 0,
      deltaUsers: entry ? entry.users.size : 0,
      tags,
      referenceUrl: typeof prediction.reference_url === 'string' && prediction.reference_url.trim().length > 0
        ? prediction.reference_url
        : (adminNotes.referenceUrl ?? ''),
      referenceSummary: adminNotes.referenceSummary ?? '',
      templateTitle: adminNotes.templateTitle ?? prediction.title,
    } satisfies PredictionStat;
  });
}

async function refreshHotTopics(): Promise<HotTopic[]> {
  if (!hotTopicRefreshPromise) {
    hotTopicRefreshPromise = (async () => {
      const predictions = await fetchActivePredictions();
      if (predictions.length === 0) {
        return [];
      }

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const bets = await fetchRecentBets(since);
      const stats = buildPredictionStats(predictions, bets);
      const topics = computeHeatScores(stats).slice(0, HOT_TOPICS_CACHE_SIZE);

      const entries = topics.map((topic) => ({ score: topic.heat, value: topic }));
      await cacheSetZSet(HOT_TOPICS_KEY, entries, HOT_TOPICS_TTL);
      return topics;
    })().finally(() => {
      hotTopicRefreshPromise = null;
    });
  }

  return hotTopicRefreshPromise;
}

function filterByTag(topics: HotTopic[], tag?: string): HotTopic[] {
  if (!tag) {
    return topics;
  }
  const normalised = normaliseTag(tag);
  return topics.filter((topic) => topic.tags.some((item) => normaliseTag(item) === normalised));
}

async function loadTopicsFromCache(limit: number): Promise<HotTopic[] | null> {
  const cached = await cacheGetZSet<HotTopic>(HOT_TOPICS_KEY, Math.max(limit, HOT_TOPICS_CACHE_SIZE));
  if (!cached) {
    return null;
  }
  return cached.map((entry) => ({ ...entry.value, heat: Number(entry.score.toFixed(4)) }));
}

export async function listHotTopics(query: HotTopicQuery = {}): Promise<HotTopic[]> {
  const limit = sanitiseLimit(query.limit);

  try {
    const cached = await loadTopicsFromCache(limit);
    if (cached && cached.length > 0) {
      const filteredCached = filterByTag(cached, query.tag);
      if (filteredCached.length > 0 || !query.tag) {
        return filteredCached.slice(0, limit);
      }
    }

    const fresh = await refreshHotTopics();
    const filteredFresh = filterByTag(fresh, query.tag);
    return filteredFresh.slice(0, limit);
  } catch (error) {
    console.warn('Failed to list hot topics:', error instanceof Error ? error.message : error);
    return [];
  }
}

function buildNewsCacheKey(marketId: string): string {
  return `insights:news:${marketId}`;
}

function parseCachedNews(record: Record<string, string> | null, marketId: string): MarketNewsItem[] {
  if (!record) {
    return [];
  }
  const items: MarketNewsItem[] = [];
  for (const value of Object.values(record)) {
    try {
      const parsed = JSON.parse(value) as MarketNewsItem;
      if (parsed && parsed.marketId === marketId) {
        items.push(parsed);
      }
    } catch {
      // ignore malformed cache entry
    }
  }
  return items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function loadPrediction(marketId: string): Promise<PredictionRow | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('predictions')
      .select('id,title,description,admin_notes,tags,reference_url')
      .eq('id', marketId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load prediction for market news:', error.message);
      return null;
    }
    return data ?? null;
  } catch (error) {
    console.warn('Unexpected error when loading prediction for market news:', error);
    return null;
  }
}

function collectKeywords(prediction: PredictionRow, adminNotes: AdminNotes, dbTags: string[]): string[] {
  const keywords = new Set<string>();
  dbTags.forEach((tag) => keywords.add(normaliseTag(tag)));
  if (Array.isArray(adminNotes.tags)) {
    for (const tag of adminNotes.tags) {
      if (typeof tag === 'string') {
        keywords.add(normaliseTag(tag));
      }
    }
  }

  prediction.title
    .split(/[^a-zA-Z0-9\u4e00-\u9fa5]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1)
    .slice(0, 6)
    .forEach((part) => keywords.add(part.toLowerCase()));

  return Array.from(keywords);
}

function selectFeeds(tags: string[]): typeof RSS_FEEDS {
  if (tags.length === 0) {
    return RSS_FEEDS;
  }
  const lower = tags.map(normaliseTag);
  const matched = RSS_FEEDS.filter((feed) => feed.tags.some((tag) => lower.includes(tag)));
  return matched.length > 0 ? matched : RSS_FEEDS;
}

function buildTweetQuery(keywords: string[]): string {
  if (keywords.length === 0) {
    return '';
  }
  return keywords.slice(0, 3).join(' OR ');
}

function mapRssToRaw(article: { id: string; title: string; content: string; link: string; publishedAt: string; source: string }): RawNewsItem {
  return {
    id: `rss:${article.id}`,
    source: article.source,
    sourceType: 'media',
    title: article.title,
    content: article.content,
    url: article.link,
    publishedAt: article.publishedAt,
  } satisfies RawNewsItem;
}

function mapTweetToRaw(tweet: { id: string; text: string; createdAt: string; url: string }): RawNewsItem {
  return {
    id: `tweet:${tweet.id}`,
    source: 'Twitter',
    sourceType: 'social',
    title: tweet.text.split('\n')[0]?.slice(0, 80) ?? tweet.text,
    content: tweet.text,
    url: tweet.url,
    publishedAt: tweet.createdAt,
  } satisfies RawNewsItem;
}

function buildNewsId(marketId: string, rawId: string): string {
  const hash = createHash('sha1');
  hash.update(marketId);
  hash.update(rawId);
  return hash.digest('hex');
}

async function enrichNewsItems(items: RawNewsItem[]): Promise<Array<RawNewsItem & { summary: string; sentiment: MarketNewsItem['sentiment'] }>> {
  const enriched = await Promise.all(items.map(async (item) => {
    const result = await summarizeContent({ title: item.title, content: item.content });
    return {
      ...item,
      summary: result.summary,
      sentiment: result.sentiment,
    };
  }));
  return enriched;
}

function convertRawToNews(marketId: string, items: Array<RawNewsItem & { summary: string; sentiment: MarketNewsItem['sentiment'] }>): MarketNewsItem[] {
  const results: MarketNewsItem[] = [];
  const hashes: bigint[] = [];

  for (const item of items) {
    const hash = computeSimhash(`${item.title} ${item.summary}`);
    const duplicate = hashes.some((existing) => isSimilar(existing, hash, 8));
    if (duplicate) {
      continue;
    }
    hashes.push(hash);

    results.push({
      id: buildNewsId(marketId, item.id),
      marketId,
      source: item.source,
      sourceType: item.sourceType,
      publishedAt: item.publishedAt,
      summary: item.summary,
      url: item.url,
      sentiment: item.sentiment,
    });
  }

  return results.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function buildMarketNews(marketId: string, overrideTags: string[]): Promise<MarketNewsItem[]> {
  const prediction = await loadPrediction(marketId);
  if (!prediction) {
    return [];
  }

  const adminNotes = parseAdminNotes(prediction.admin_notes);
  const dbTags = Array.isArray(prediction.tags)
    ? prediction.tags.map((tag) => String(tag)).filter(Boolean)
    : [];
  const notesTags = Array.isArray(adminNotes?.tags)
    ? (adminNotes?.tags as unknown[]).map((tag) => String(tag)).filter(Boolean)
    : [];
  const combinedTags = overrideTags.length > 0 ? overrideTags : [...dbTags, ...notesTags];
  const keywords = collectKeywords(prediction, adminNotes ?? {}, combinedTags);
  const feeds = selectFeeds(combinedTags.length > 0 ? combinedTags : keywords);

  const rssResults = await Promise.all(feeds.map(async (feed) => {
    const articles = await fetchRssArticles(feed.url, { limit: 20 });
    return articles
      .filter((article) => {
        if (keywords.length === 0) {
          return true;
        }
        const lower = `${article.title} ${article.content}`.toLowerCase();
        return keywords.some((keyword) => lower.includes(keyword));
      })
      .map(mapRssToRaw);
  }));

  const tweetQuery = buildTweetQuery(keywords);
  const tweets = tweetQuery
    ? await searchTweets(tweetQuery, { maxResults: 20 })
    : [];

  const rawItems: RawNewsItem[] = [
    ...rssResults.flat(),
    ...tweets.map(mapTweetToRaw),
  ];

  if (rawItems.length === 0) {
    return [];
  }

  const enriched = await enrichNewsItems(rawItems.slice(0, 40));
  return convertRawToNews(marketId, enriched).slice(0, 10);
}

export async function getMarketNews(marketId: string, overrideTags: string[] = []): Promise<MarketNewsItem[]> {
  if (!marketId) {
    return [];
  }

  try {
    const cacheKey = buildNewsCacheKey(marketId);
    const cachedHash = await cacheGetHash(cacheKey);
    const cachedItems = parseCachedNews(cachedHash, marketId);
    if (cachedItems.length > 0) {
      return cachedItems;
    }

    const freshItems = await buildMarketNews(marketId, overrideTags);
    if (freshItems.length > 0) {
      const payload: Record<string, string> = {};
      for (const item of freshItems) {
        payload[item.id] = JSON.stringify(item);
      }
      await cacheSetHash(cacheKey, payload, NEWS_TTL);
    }
    return freshItems;
  } catch (error) {
    console.warn('Failed to get market news:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * 获取请求中的分页 limit，保证在 1~20 之间。
 */
export function resolveLimit(req: Request, fallback = 10): number {
  return sanitiseLimit(typeof req.query.limit === 'string' ? Number(req.query.limit) : NaN, fallback);
}
