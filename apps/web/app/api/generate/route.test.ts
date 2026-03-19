// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('Generate API', () => {
  it('returns 400 for invalid prompt', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns a local generated scene when no API key exists', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'A character running in the snow' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.meta.version).toBe('1.0.0');
    expect(Array.isArray(json.actors)).toBe(true);
    expect(json.actors.some((a: { type: string }) => a.type === 'camera')).toBe(true);
    expect(json.environment.weather.type).toBe('snow');
    expect(Array.isArray(json.storyboard)).toBe(true);
  });
});
