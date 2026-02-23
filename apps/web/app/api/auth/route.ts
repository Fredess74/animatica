import { NextResponse } from 'next/server';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  // Mock authenticated user
  return NextResponse.json({
    authenticated: true,
    user: {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@animatica.com',
    },
  });
}
