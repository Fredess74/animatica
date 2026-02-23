import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from './route';

// Mock DB
vi.mock('@/lib/mockDb', () => ({
  db: {
    projects: {
      findMany: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Project' }]),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ id: '2', ...data })),
    },
  },
}));

describe('Projects API', () => {
  it('GET /api/projects returns list of projects', async () => {
    const request = new Request('http://localhost/api/projects');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Test Project');
  });

  it('POST /api/projects creates a new project', async () => {
    const body = {
      name: 'New Project',
      description: 'Description',
      state: {
        meta: { title: 'New Project', version: '1.0.0' },
        environment: {
          ambientLight: { intensity: 1, color: '#ffffff' },
          sun: { position: [0, 1, 0], intensity: 1, color: '#ffffff' },
          skyColor: '#000000',
        },
        actors: [],
        timeline: { duration: 10, cameraTrack: [], animationTracks: [] },
        library: { clips: [] },
      },
    };

    const request = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('New Project');
    expect(data.id).toBe('2');
  });

  it('POST /api/projects returns 400 for invalid input', async () => {
    const body = { name: '' }; // Invalid: missing state, empty name
    const request = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
