import { NextResponse } from 'next/server';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// In-memory store for rate limiting (not suitable for serverless scale, fine for dev/demo)
const ipRequests = new Map<string, { count: number; startTime: number }>();

export function checkRateLimit(ip: string, config: RateLimitConfig = { limit: 100, windowMs: 60000 }): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record) {
    ipRequests.set(ip, { count: 1, startTime: now });
    return true;
  }

  if (now - record.startTime > config.windowMs) {
    // Reset window
    ipRequests.set(ip, { count: 1, startTime: now });
    return true;
  }

  if (record.count >= config.limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function withRateLimit(
  req: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // In a real app, get IP from headers like 'x-forwarded-for'
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Strict rate limit for demo: 100 requests per minute
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return handler();
}
