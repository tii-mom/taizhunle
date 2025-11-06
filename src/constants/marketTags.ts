export const MARKET_TAG_WHITELIST = ['sports', 'politics', 'society', 'entertainment', 'crypto', 'other'] as const;

export type MarketTag = (typeof MARKET_TAG_WHITELIST)[number];

const TAG_SET = new Set<string>(MARKET_TAG_WHITELIST);

export const MARKET_TAG_SET = TAG_SET;

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveMarketTags(raw?: Array<string | null | undefined>): MarketTag[] {
  if (!raw || raw.length === 0) {
    return [];
  }

  const unique: MarketTag[] = [];
  for (const entry of raw) {
    if (!entry) {
      throw new Error('Tags contain empty value');
    }
    const lower = normalise(entry);
    if (!TAG_SET.has(lower)) {
      throw new Error(`Tag "${entry}" is not allowed`);
    }
    if (!unique.includes(lower as MarketTag)) {
      unique.push(lower as MarketTag);
    }
  }
  return unique;
}

export function filterMarketTags(raw?: Array<string | null | undefined>): MarketTag[] {
  if (!raw || raw.length === 0) {
    return [];
  }
  const seen = new Set<MarketTag>();
  const filtered: MarketTag[] = [];
  for (const entry of raw) {
    if (!entry) {
      continue;
    }
    const lower = normalise(entry) as MarketTag;
    if (!TAG_SET.has(lower) || seen.has(lower)) {
      continue;
    }
    seen.add(lower);
    filtered.push(lower);
  }
  return filtered;
}
