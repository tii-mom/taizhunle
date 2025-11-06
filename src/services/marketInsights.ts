const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

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

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function loadHotTopics(tag?: string, limit?: number): Promise<HotTopic[]> {
  const searchParams = new URLSearchParams();
  if (tag) {
    searchParams.set('tag', tag);
  }
  if (limit) {
    searchParams.set('limit', String(limit));
  }
  const query = searchParams.toString();
  const payload = await apiFetch<{ items: HotTopic[] }>(`/hot-topics${query ? `?${query}` : ''}`);
  return payload.items;
}

export async function loadMarketNews(marketId: string, tags?: string[]): Promise<MarketNewsItem[]> {
  if (!marketId) {
    return [];
  }
  const searchParams = new URLSearchParams();
  if (tags && tags.length > 0) {
    searchParams.set('tags', tags.join(','));
  }
  const query = searchParams.toString();
  const payload = await apiFetch<{ items: MarketNewsItem[] }>(`/markets/${marketId}/news${query ? `?${query}` : ''}`);
  return payload.items;
}
