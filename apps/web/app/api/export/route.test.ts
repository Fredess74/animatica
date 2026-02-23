import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('Export API', () => {
  it('POST /api/export starts an export job', async () => {
    const body = {
      projectId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
      format: 'mp4',
      quality: '1080p',
    };

    const request = new Request('http://localhost/api/export', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('pending');
    expect(data.jobId).toBeDefined();
  });

  it('POST /api/export returns 400 for invalid input', async () => {
    const body = { projectId: 'invalid-uuid' };
    const request = new Request('http://localhost/api/export', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
