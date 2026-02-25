// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => null),
}));

describe('Export API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/export', () => {
    it('should start export with valid options', async () => {
      const body = {
        projectId: '123e4567-e89b-12d3-a456-426614174000', // valid UUID
        resolution: '1080p',
        fps: 30,
        format: 'mp4',
      };

      const req = new NextRequest('http://localhost/api/export', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(202);
      expect(json.jobId).toBeDefined();
      expect(json.status).toBe('pending');
    });

    it('should fail with invalid options', async () => {
      const body = {
        projectId: 'invalid', // invalid UUID
      };

      const req = new NextRequest('http://localhost/api/export', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const res = await POST(req);
      expect(res.status).toBe(400); // Zod Error
    });
  });
});
