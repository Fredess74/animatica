// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from './route';
import * as db from '@/lib/db';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

vi.mock('@/lib/db', () => ({
  getUser: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => null),
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth (Login)', () => {
    it('should login with correct credentials', async () => {
      const mockUser = { id: 'user-1', email: 'user@example.com' };
      vi.mocked(db.getUser).mockResolvedValue(mockUser as any);

      const body = { email: 'user@example.com', password: 'password' };
      const req = new NextRequest('http://localhost/api/auth', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.user).toEqual(mockUser);
      expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'mock-token', expect.any(Object));
    });

    it('should fail with incorrect credentials', async () => {
      const req = new NextRequest('http://localhost/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email: 'wrong', password: 'wrong' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth (Session)', () => {
    it('should return user if logged in', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'mock-token' });
      const mockUser = { id: 'user-1' };
      vi.mocked(db.getUserById).mockResolvedValue(mockUser as any);

      const req = new NextRequest('http://localhost/api/auth');
      const res = await GET(req);
      const json = await res.json();

      expect(json.user).toEqual(mockUser);
    });

    it('should return null user if not logged in', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const req = new NextRequest('http://localhost/api/auth');
      const res = await GET(req);
      const json = await res.json();

      expect(json.user).toBeNull();
    });
  });

  describe('DELETE /api/auth (Logout)', () => {
    it('should logout successfully', async () => {
      const req = new NextRequest('http://localhost/api/auth', { method: 'DELETE' });
      const res = await DELETE(req);

      expect(res.status).toBe(200);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });
  });
});
