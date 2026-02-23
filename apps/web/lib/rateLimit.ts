// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > WINDOW_SIZE) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}

export function getIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}
