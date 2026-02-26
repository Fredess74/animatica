// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as db from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => null),
}));

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return a list of projects', async () => {
      const mockProjects = [{ id: '1', state: { meta: { title: 'Test' } } }];
      vi.mocked(db.getProjects).mockResolvedValue(mockProjects as any);

      const req = new NextRequest('http://localhost/api/projects');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual(mockProjects);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a project with valid meta', async () => {
      const mockProject = { id: 'new-id', state: { meta: { title: 'New Project', version: '1.0.0' } } };
      vi.mocked(db.createProject).mockResolvedValue(mockProject as any);

      const body = { meta: { title: 'New Project', version: '1.0.0' } };
      const req = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json).toEqual(mockProject);
      expect(db.createProject).toHaveBeenCalled();
    });

    it('should fail with invalid body', async () => {
      const req = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({}), // Missing meta
      });

      const res = await POST(req);
      expect(res.status).toBe(400); // Validation Error
    });
  });
});
