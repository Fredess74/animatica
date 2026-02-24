import { describe, it, expect } from 'vitest';
import { POST as loginPost } from './login/route';
import { POST as signupPost } from './signup/route';

// Mock Request object
function createMockRequest(body: any) {
  return {
    json: async () => body,
    headers: {
      get: () => '127.0.0.1',
    },
  } as unknown as Request;
}

describe('Auth API', () => {
  const uniqueId = Date.now();

  it('should signup a new user', async () => {
    const body = {
      email: `newuser-${uniqueId}@example.com`,
      password: 'password123',
      name: 'New User',
    };
    const req = createMockRequest(body);
    const res = await signupPost(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.user.email).toBe(body.email);
    expect(data.token).toBeDefined();
  });

  it('should not signup existing user', async () => {
     const email = `duplicate-${uniqueId}@example.com`;
     // First signup
     const body = { email, password: 'password123' };
     await signupPost(createMockRequest(body));

     // Second signup
     const res = await signupPost(createMockRequest(body));
     expect(res.status).toBe(409);
  });

  it('should login existing user', async () => {
    // Ensure user exists (from mock db seed)
    const body = { email: 'demo@animatica.com', password: 'password123' };
    const req = createMockRequest(body);
    const res = await loginPost(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.email).toBe(body.email);
  });

  it('should fail login with wrong password', async () => {
    const body = { email: 'demo@animatica.com', password: 'wrongpassword' };
    const req = createMockRequest(body);
    const res = await loginPost(req);

    expect(res.status).toBe(401);
  });
});
