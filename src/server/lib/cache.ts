type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type ZSetEntry<T> = {
  score: number;
  value: T;
};

type ZSetPayload<T> = {
  entries: ZSetEntry<T>[];
  expiresAt: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private zsets = new Map<string, ZSetPayload<unknown>>();
  private hashes = new Map<string, CacheEntry<Record<string, string>>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  async getZSet<T>(key: string): Promise<ZSetEntry<T>[] | null> {
    const payload = this.zsets.get(key);
    if (!payload) {
      return null;
    }
    if (Date.now() > payload.expiresAt) {
      this.zsets.delete(key);
      return null;
    }
    return payload.entries as ZSetEntry<T>[];
  }

  async setZSet<T>(key: string, entries: ZSetEntry<T>[], ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    this.zsets.set(key, { entries: sorted, expiresAt });
  }

  async getHash(key: string): Promise<Record<string, string> | null> {
    const entry = this.hashes.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.hashes.delete(key);
      return null;
    }
    return entry.value;
  }

  async setHash(key: string, value: Record<string, string>, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.hashes.set(key, { value, expiresAt });
  }

  async clear(key: string): Promise<void> {
    this.store.delete(key);
    this.zsets.delete(key);
    this.hashes.delete(key);
  }
}

type RedisLike = {
  get: (...args: any[]) => Promise<string | null>;
  set: (...args: any[]) => Promise<unknown>;
  zrevrange: (...args: any[]) => Promise<string[]>;
  multi: () => {
    del: (...args: any[]) => void;
    zadd: (...args: any[]) => void;
    expire: (...args: any[]) => void;
    hset: (...args: any[]) => void;
    hgetall: (...args: any[]) => Promise<Record<string, string>>;
    exec: () => Promise<unknown>;
  };
  connect: () => Promise<void>;
  on: (...args: any[]) => void;
  hgetall: (...args: any[]) => Promise<Record<string, string>>;
  hset: (...args: any[]) => Promise<unknown>;
  del: (...args: any[]) => Promise<unknown>;
  expire: (...args: any[]) => Promise<unknown>;
};

let memoryCache: MemoryCache | null = null;
let redisClient: RedisLike | null | false = null;

async function ensureRedis(): Promise<RedisLike | null> {
  if (redisClient === false) {
    return null;
  }
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (!redisUrl) {
    redisClient = false;
    return null;
  }

  try {
    const { default: IORedis } = await import('ioredis');
    redisClient = new IORedis(redisUrl, {
      lazyConnect: true,
    });
    redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Failed to initialize Redis, fallback to in-memory cache:', error instanceof Error ? error.message : error);
    redisClient = false;
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await ensureRedis();
  if (redis) {
    const raw = await redis.get(key);
    if (raw) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }
    return null;
  }

  const cache = getMemoryCache();
  return cache.get<T>(key);
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const redis = await ensureRedis();
  if (redis) {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return;
  }
  const cache = getMemoryCache();
  await cache.set(key, value, ttlSeconds);
}

export async function cacheGetZSet<T>(key: string, limit: number): Promise<ZSetEntry<T>[] | null> {
  const redis = await ensureRedis();
  if (redis) {
    const entries = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    if (entries.length === 0) {
      return null;
    }
    const result: ZSetEntry<T>[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      try {
        result.push({ value: JSON.parse(entries[i]) as T, score: Number(entries[i + 1]) });
      } catch {
        // skip malformed entry
      }
    }
    return result;
  }
  const cache = getMemoryCache();
  const payload = await cache.getZSet<T>(key);
  if (!payload) {
    return null;
  }
  return payload.slice(0, limit);
}

export async function cacheSetZSet<T>(key: string, entries: ZSetEntry<T>[], ttlSeconds: number): Promise<void> {
  const redis = await ensureRedis();
  if (redis) {
    const pipeline = redis.multi();
    pipeline.del(key);
    entries.forEach((entry) => {
      pipeline.zadd(key, entry.score, JSON.stringify(entry.value));
    });
    pipeline.expire(key, ttlSeconds);
    await pipeline.exec();
    return;
  }
  const cache = getMemoryCache();
  await cache.setZSet(key, entries, ttlSeconds);
}

export async function cacheGetHash(key: string): Promise<Record<string, string> | null> {
  const redis = await ensureRedis();
  if (redis) {
    const entries = await redis.hgetall(key);
    if (entries && Object.keys(entries).length > 0) {
      return entries;
    }
    return null;
  }
  const cache = getMemoryCache();
  return cache.getHash(key);
}

export async function cacheSetHash(key: string, value: Record<string, string>, ttlSeconds: number): Promise<void> {
  const redis = await ensureRedis();
  if (redis) {
    const pipeline = redis.multi();
    pipeline.del(key);
    pipeline.hset(key, value);
    pipeline.expire(key, ttlSeconds);
    await pipeline.exec();
    return;
  }
  const cache = getMemoryCache();
  await cache.setHash(key, value, ttlSeconds);
}

export async function cacheClear(key: string): Promise<void> {
  const redis = await ensureRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  const cache = getMemoryCache();
  await cache.clear(key);
}

function getMemoryCache(): MemoryCache {
  if (!memoryCache) {
    memoryCache = new MemoryCache();
  }
  return memoryCache;
}
