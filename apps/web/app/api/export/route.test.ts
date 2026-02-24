import { describe, it, expect } from 'vitest';
import { POST } from './route';

// Mock Request object
function createMockRequest(body?: any) {
  return {
    method: 'POST',
    json: async () => body,
    headers: {
      get: () => '127.0.0.1',
    },
  } as unknown as Request;
}

describe('Export API', () => {
  it('should start an export job', async () => {
    const body = {
      projectId: 'project-1',
      format: 'mp4',
      resolution: '1080p',
      fps: 60,
    };
    const req = createMockRequest(body);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(202);
    expect(data.jobId).toBeDefined();
    expect(data.status).toBe('pending');
    expect(data.settings.fps).toBe(60);
  });

  it('should validate input', async () => {
    const body = {
      projectId: 'project-1',
      format: 'invalid-format', // Error
      resolution: '1080p',
    };
    const req = createMockRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
