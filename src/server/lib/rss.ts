import { createHash } from 'node:crypto';

export type RssArticle = {
  id: string;
  title: string;
  link: string;
  content: string;
  publishedAt: string;
  source: string;
};

type FetchOptions = {
  limit?: number;
  timeoutMs?: number;
};

const TAG_ITEM = /<item[\s\S]*?<\/item>/gi;
const TAG_ENTRY = /<entry[\s\S]*?<\/entry>/gi;

function decodeHtmlEntities(input: string): string {
  if (!input) {
    return '';
  }
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function stripTags(input: string): string {
  return decodeHtmlEntities(input.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractTagValue(block: string, tagName: string): string | null {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = pattern.exec(block);
  return match ? match[1].trim() : null;
}

function extractLink(block: string): string | null {
  // Atom feeds may use <link href="..." />
  const hrefMatch = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>(?:<\/link>)?/i);
  if (hrefMatch && hrefMatch[1]) {
    return hrefMatch[1];
  }

  const value = extractTagValue(block, 'link');
  return value ? stripTags(value) : null;
}

function extractDate(block: string): string {
  const pubDate = extractTagValue(block, 'pubDate') ?? extractTagValue(block, 'updated') ?? extractTagValue(block, 'published');
  if (!pubDate) {
    return new Date().toISOString();
  }
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function extractContent(block: string): string {
  const contentEncoded = extractTagValue(block, 'content:encoded');
  if (contentEncoded) {
    return stripTags(contentEncoded);
  }
  const summary = extractTagValue(block, 'description') ?? extractTagValue(block, 'summary') ?? '';
  return stripTags(summary);
}

function buildId(link: string, title: string): string {
  const hash = createHash('sha1');
  hash.update(link || title);
  return hash.digest('hex');
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRssArticles(feedUrl: string, options: FetchOptions = {}): Promise<RssArticle[]> {
  const limit = options.limit ?? 20;
  const timeoutMs = options.timeoutMs ?? 10_000;

  try {
    const response = await fetchWithTimeout(feedUrl, timeoutMs);
    if (!response.ok) {
      console.warn('RSS feed returned non-200 status', feedUrl, response.status);
      return [];
    }

    const xml = await response.text();
    const source = new URL(feedUrl).hostname;

    const blocks = xml.match(TAG_ITEM) ?? xml.match(TAG_ENTRY) ?? [];
    const articles: RssArticle[] = [];

    for (const block of blocks.slice(0, limit)) {
      const title = stripTags(extractTagValue(block, 'title') ?? '');
      if (!title) {
        continue;
      }

      const link = extractLink(block) ?? '';
      const content = extractContent(block);
      const publishedAt = extractDate(block);

      articles.push({
        id: buildId(link, title),
        title,
        link,
        content,
        publishedAt,
        source,
      });
    }

    return articles;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('The operation was aborted')) {
      console.warn('RSS fetch aborted due to timeout', feedUrl);
    } else {
      console.warn('Failed to fetch RSS feed', feedUrl, message);
    }
    return [];
  }
}
