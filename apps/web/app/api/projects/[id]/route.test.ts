// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';
import * as db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  getProjectById: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => null),
}));

describe('Project Detail API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const params = Promise.resolve({ id: '1' });

  describe('GET /api/projects/[id]', () => {
    it('should return project if found', async () => {
      const mockProject = { id: '1', state: { meta: { title: 'Test' } } };
      vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);

      const req = new NextRequest('http://localhost/api/projects/1');
      const res = await GET(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual(mockProject);
    });

    it('should return 404 if not found', async () => {
      vi.mocked(db.getProjectById).mockResolvedValue(undefined);

      const req = new NextRequest('http://localhost/api/projects/1');
      const res = await GET(req, { params });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('should update project', async () => {
      const mockProject = { id: '1', state: { meta: { title: 'Updated' } } };
      vi.mocked(db.updateProject).mockResolvedValue(mockProject as any);

      // Provide full meta object as partial update on ProjectState.meta requires full ProjectMetaSchema unless recursively partial
      const body = {
        meta: {
          title: 'Updated',
          version: '1.0.1'
        }
      };

      const req = new NextRequest('http://localhost/api/projects/1', {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      const res = await PUT(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual(mockProject);
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('should delete project', async () => {
      vi.mocked(db.deleteProject).mockResolvedValue(true);

      const req = new NextRequest('http://localhost/api/projects/1', {
        method: 'DELETE',
      });

      const res = await DELETE(req, { params });

      expect(res.status).toBe(204);
    });
  });
});
