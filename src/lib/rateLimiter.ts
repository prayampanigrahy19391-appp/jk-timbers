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

export const rateLimit = (
  request: NextRequest,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000,
  namespace = request.nextUrl.pathname,
): { success: boolean; remaining: number; resetAt: number } => {
  const key = `${namespace}:${getIpAddress(request)}`;
  const now = Date.now();
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
};
