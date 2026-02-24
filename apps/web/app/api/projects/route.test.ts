import { describe, it, expect } from 'vitest';
import { GET as getProjects, POST as createProject } from './route';
import { GET as getProject, PUT as updateProject, DELETE as deleteProject } from './[id]/route';

// Mock Request object
function createMockRequest(body?: any, method = 'GET', url = 'http://localhost/api/projects') {
  return {
    method,
    url,
    json: async () => body || {},
    headers: {
      get: () => '127.0.0.1',
    },
  } as unknown as Request;
}

describe('Projects API', () => {
  let createdProjectId: string;

  it('should create a new project', async () => {
    const body = {
      title: 'Test Project',
      description: 'Test Description',
      authorId: 'user-1',
    };
    const req = createMockRequest(body, 'POST');
    const res = await createProject(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.title).toBe(body.title);
    expect(data.id).toBeDefined();
    createdProjectId = data.id;
  });

  it('should list projects', async () => {
    const req = createMockRequest();
    const res = await getProjects(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should get project by id', async () => {
    const req = createMockRequest();
    const params = Promise.resolve({ id: createdProjectId });
    const res = await getProject(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(createdProjectId);
  });

  it('should update project', async () => {
    const body = { title: 'Updated Title' };
    const req = createMockRequest(body, 'PUT');
    const params = Promise.resolve({ id: createdProjectId });
    const res = await updateProject(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe('Updated Title');
  });

  it('should delete project', async () => {
    const req = createMockRequest(undefined, 'DELETE');
    const params = Promise.resolve({ id: createdProjectId });
    const res = await deleteProject(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 404 for deleted project', async () => {
    const req = createMockRequest();
    const params = Promise.resolve({ id: createdProjectId });
    const res = await getProject(req, { params });

    expect(res.status).toBe(404);
  });
});
