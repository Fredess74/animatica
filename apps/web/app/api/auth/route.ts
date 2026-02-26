import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, getUserById } from '@/lib/db';
import { handleError, jsonResponse } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (sessionToken === 'mock-token') {
      const user = await getUserById('user-1');
      return jsonResponse({ user });
    }

    return jsonResponse({ user: null });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const { email, password } = await req.json();

    // Mock Authentication Logic
    if (email === 'user@example.com' && password === 'password') {
      const user = await getUser(email);
      if (user) {
        const cookieStore = await cookies();
        cookieStore.set('session', 'mock-token', { httpOnly: true, path: '/' });
        return jsonResponse({ user });
      }
    }

    return jsonResponse({ error: 'Invalid credentials' }, 401);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return jsonResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
