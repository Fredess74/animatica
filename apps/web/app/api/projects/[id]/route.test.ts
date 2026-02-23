import { describe, it, expect, vi } from 'vitest';
import { GET, PUT, DELETE } from './route';

// Mock DB
vi.mock('@/lib/mockDb', () => ({
  db: {
    projects: {
      findUnique: vi.fn().mockImplementation((id) =>
        id === '1' ? Promise.resolve({ id: '1', name: 'Test Project' }) : Promise.resolve(null)
      ),
      update: vi.fn().mockImplementation((id, data) =>
        id === '1' ? Promise.resolve({ id: '1', ...data }) : Promise.resolve(null)
      ),
      delete: vi.fn().mockImplementation((id) =>
        id === '1' ? Promise.resolve({ id: '1' }) : Promise.resolve(null)
      ),
    },
  },
}));

describe('Project ID API', () => {
  it('GET /api/projects/[id] returns project', async () => {
    const params = Promise.resolve({ id: '1' });
    const request = new Request('http://localhost/api/projects/1');
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Test Project');
  });

  it('GET /api/projects/[id] returns 404 for unknown project', async () => {
    const params = Promise.resolve({ id: '99' });
    const request = new Request('http://localhost/api/projects/99');
    const response = await GET(request, { params });

    expect(response.status).toBe(404);
  });

  it('PUT /api/projects/[id] updates project', async () => {
    const params = Promise.resolve({ id: '1' });
    const body = { name: 'Updated Project' };
    const request = new Request('http://localhost/api/projects/1', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const response = await PUT(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Updated Project');
  });

  it('DELETE /api/projects/[id] deletes project', async () => {
    const params = Promise.resolve({ id: '1' });
    const request = new Request('http://localhost/api/projects/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params });
    expect(response.status).toBe(200);
  });
});
