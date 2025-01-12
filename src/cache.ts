type CacheStore = {
  [key: string]: {
    data: any;
    expiry: number;
  };
};

const cache: CacheStore = {};

/**
 * Set a value in the cache
 * @param key - The cache key
 * @param data - The data to cache
 * @param ttl - Time-to-live in milliseconds
 */
export const setCache = (key: string, data: any, ttl: number) => {
  const expiry = Date.now() + ttl;
  cache[key] = { data, expiry };
};

/**
 * Get a value from the cache
 * @param key - The cache key
 * @returns The cached data, or null if not found or expired
 */
export const getCache = (key: string): any | null => {
  const cached = cache[key];
  if (!cached) return null;

  // Check if the cache has expired
  if (Date.now() > cached.expiry) {
    delete cache[key]; // Remove expired cache entry
    return null;
  }

  return cached.data;
};
