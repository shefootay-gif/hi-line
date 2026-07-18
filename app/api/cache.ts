export const cache = new Map<string, { value: unknown; expiry: number }>();

export const getCached = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value as T;
};

export const setCached = (key: string, value: unknown, ttlSeconds: number = 300) => {
  cache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
};

export const clearCachePrefix = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};
