import { config } from '../../config/env.js';

export type TweetResult = {
  id: string;
  text: string;
  createdAt: string;
  authorId?: string;
  url: string;
};

type SearchOptions = {
  maxResults?: number;
  language?: string;
};

const DEFAULT_LANGUAGE = 'zh';
const BASE_URL = 'https://api.twitter.com/2/tweets/search/recent';

export async function searchTweets(query: string, options: SearchOptions = {}): Promise<TweetResult[]> {
  const token = config.social.twitter.bearerToken;
  if (!token) {
    return [];
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const maxResults = Math.min(Math.max(options.maxResults ?? 20, 10), 100);
  const language = options.language ?? DEFAULT_LANGUAGE;

  const params = new URLSearchParams({
    query: `${trimmed} lang:${language} -is:retweet -is:reply`,
    'tweet.fields': 'created_at,lang,public_metrics,author_id',
    max_results: String(maxResults),
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn('Twitter API responded with non-200 status', response.status);
      return [];
    }

    const payload = await response.json();
    if (!payload?.data || !Array.isArray(payload.data)) {
      return [];
    }

    return payload.data.map((tweet: any) => {
      const createdAt = typeof tweet.created_at === 'string' ? tweet.created_at : new Date().toISOString();
      const url = tweet.id ? `https://twitter.com/i/web/status/${tweet.id}` : '';
      return {
        id: String(tweet.id),
        text: String(tweet.text ?? ''),
        createdAt,
        authorId: tweet.author_id ? String(tweet.author_id) : undefined,
        url,
      } satisfies TweetResult;
    });
  } catch (error) {
    console.warn('Failed to query Twitter API', error instanceof Error ? error.message : String(error));
    return [];
  }
}
