import { redis } from './redis';
import { logger } from './logger';

export interface CacheAccessStats {
  hits: number;
  lastAccess: number;
}

const ACCESS_COUNTER_PREFIX = 'stats:access:';
const CACHE_CONTENT_PREFIX = 'cache:content:';
const HOT_THRESHOLD = 5; // Access count in window to promote to Redis
const STATS_EXPIRY_MS = 60 * 1000; // 1 minute access tracking window

export class AdaptiveCache {
  // Check if an item is hot and serve it from Redis cache, otherwise track access hit and fallback to callback
  async getOrPreheat<T>(
    key: string,
    fetchSource: () => Promise<T>,
    expirySeconds = 300
  ): Promise<T> {
    const statsKey = `${ACCESS_COUNTER_PREFIX}${key}`;
    const cacheKey = `${CACHE_CONTENT_PREFIX}${key}`;

    try {
      // 1. Check if content exists in Redis (i.e. has been preheated/promoted)
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(`[AdaptiveCache] HIT: Served hot item from cache: ${key}`);
        return JSON.parse(cached) as T;
      }

      // 2. Fetch fresh data
      const data = await fetchSource();

      // 3. Track item access stats in Redis
      const accessCountRaw = await redis.incr(statsKey);
      if (accessCountRaw === 1) {
        // Set stats window expiry
        await redis.set(statsKey, '1', 'PX', STATS_EXPIRY_MS);
      }

      // 4. Promote to Redis Cache if threshold crossed
      if (accessCountRaw >= HOT_THRESHOLD) {
        logger.info(`[AdaptiveCache] PROMOTING: Item promoted to hot cache: ${key} (hits: ${accessCountRaw})`);
        await redis.set(cacheKey, JSON.stringify(data), 'EX', expirySeconds);
        // Clear access counter since it's now in cache
        await redis.del(statsKey);
      }

      return data;
    } catch (err) {
      const error = err as Error;
      logger.error(`[AdaptiveCache] Failed caching operations for key: ${key}. Falling back to source.`, {
        error: error.message,
      });
      return await fetchSource();
    }
  }

  // Manually purge cache entry
  async invalidate(key: string) {
    const cacheKey = `${CACHE_CONTENT_PREFIX}${key}`;
    try {
      await redis.del(cacheKey);
      logger.info(`[AdaptiveCache] Invalidated hot cache key: ${key}`);
    } catch (err) {
      const error = err as Error;
      logger.error(`[AdaptiveCache] Failed to invalidate cache key: ${key}`, { error: error.message });
    }
  }
}

export const adaptiveCache = new AdaptiveCache();
