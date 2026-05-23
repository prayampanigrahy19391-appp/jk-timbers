import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requestStore = new Map<string, RateLimitEntry>();

const getIpAddress = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  const ip = (request as unknown as { ip?: string }).ip;
  return ip ?? request.headers.get('x-real-ip') ?? 'unknown';
};

// Rate limiter works both synchronously (for edge middleware fallback)
// and asynchronously (using Redis in Node.js contexts).
export const rateLimit = (
  request: NextRequest,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000,
  namespace = request.nextUrl.pathname,
): { success: boolean; remaining: number; resetAt: number } | Promise<{ success: boolean; remaining: number; resetAt: number }> => {
  const key = `${namespace}:${getIpAddress(request)}`;
  const now = Date.now();

  // Edge runtime or browser environments cannot load standard Redis socket drivers
  // We fall back automatically to the standard thread-safe Map store.
  const isEdge = 'EdgeRuntime' in globalThis || process.env.NEXT_RUNTIME === 'edge';

  if (isEdge) {
    return runMemoryRateLimit(key, now, maxRequests, windowMs);
  }

  // Node.js environments can execute Redis asynchronously
  return runRedisRateLimit(key, now, maxRequests, windowMs);
};

function runMemoryRateLimit(
  key: string,
  now: number,
  maxRequests: number,
  windowMs: number,
): { success: boolean; remaining: number; resetAt: number } {
  const existing = requestStore.get(key);

  if (!existing || existing.resetAt <= now) {
    requestStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  requestStore.set(key, existing);

  return { success: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

async function runRedisRateLimit(
  key: string,
  now: number,
  maxRequests: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  try {
    // Dynamic import to prevent Edge compiler resolution errors
    const { redis } = await import('./redis');
    const pttl = await redis.pttl(key);

    if (pttl === -2) {
      await redis.set(key, '1', 'PX', windowMs);
      return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    const currentVal = await redis.get(key);
    const count = currentVal ? parseInt(currentVal, 10) : 0;

    if (count >= maxRequests) {
      const resetAt = now + (pttl > 0 ? pttl : windowMs);
      return { success: false, remaining: 0, resetAt };
    }

    const newCount = await redis.incr(key);
    const resetAt = now + (pttl > 0 ? pttl : windowMs);
    return { success: true, remaining: maxRequests - newCount, resetAt };
  } catch {
    // Fall back gracefully to memory limiter on failure
    return runMemoryRateLimit(key, now, maxRequests, windowMs);
  }
}
