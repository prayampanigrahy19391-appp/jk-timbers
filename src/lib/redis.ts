import Redis from 'ioredis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL;

class FallbackRedisClient {
  private store = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiry = Date.now() + duration;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key);
    return deleted ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const val = current ? parseInt(current, 10) : 0;
    const next = val + 1;
    await this.set(key, next.toString());
    return next;
  }

  async pttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return -2;
    if (!item.expiry) return -1;
    const remaining = item.expiry - Date.now();
    return remaining > 0 ? remaining : -2;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }
}

let redisClient: Redis | FallbackRedisClient;

if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error, falling back to in-memory mode', { error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis server');
    });
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to initialize Redis client, falling back to in-memory mode', { error: error.message });
    redisClient = new FallbackRedisClient();
  }
} else {
  logger.warn('REDIS_URL is not set. Using local in-memory fallback for caching/rate-limiting');
  redisClient = new FallbackRedisClient();
}

export const redis = redisClient;
