interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_TRACKED_CLIENTS = 5_000;

function removeExpiredRecords(now: number) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) rateLimitStore.delete(key);
  }
}

/**
 * Checks if a given identifier has exceeded the allowed request limit.
 * @param identifier Client IP or unique session identifier
 * @param limit Maximum allowed requests in the window
 * @param windowMs Time window in milliseconds (default 60 seconds)
 */
export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  if (rateLimitStore.size >= MAX_TRACKED_CLIENTS) removeExpiredRecords(now);
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}
