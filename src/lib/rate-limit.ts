interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter with sliding window expiration
 */
export function checkRateLimit(key: string, maxRequests = 5, windowMs = 60 * 1000): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean expired
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}
