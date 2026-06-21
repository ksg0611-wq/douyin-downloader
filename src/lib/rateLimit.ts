interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipCache = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipCache.entries()) {
      if (now > record.resetTime) {
        ipCache.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Gets the client IP address from the request headers.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }
  return '127.0.0.1';
}

/**
 * Checks if the request from the client IP should be rate limited.
 * Default: 5 requests per 1 minute (60000ms)
 */
export function isRateLimited(ip: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = ipCache.get(ip);

  if (!record) {
    ipCache.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (now > record.resetTime) {
    // Window has expired. Reset for this IP.
    record.count = 1;
    record.resetTime = now + windowMs;
    return false;
  }

  record.count += 1;
  if (record.count > limit) {
    return true;
  }

  return false;
}
