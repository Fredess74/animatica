import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(6), // In a real app, this would be hashed
  name: z.string().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  authorId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sceneData: z.record(z.string(), z.any()).optional(), // Placeholder for engine scene data
});

export type Project = z.infer<typeof ProjectSchema>;

// Mock Database
export class MockDB {
  private users: User[] = [];
  private projects: Project[] = [];

  constructor() {
    // Seed with some data
    this.users.push({
      id: 'user-1',
      email: 'demo@animatica.com',
      password: 'password123',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    });

    this.projects.push({
      id: 'project-1',
      title: 'My First Animation',
      description: 'A cool demo project',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sceneData: {},
    });
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Project methods
  async getProjects(authorId?: string): Promise<Project[]> {
    if (authorId) {
      return this.projects.filter((p) => p.authorId === authorId);
    }
    return this.projects;
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.projects.find((p) => p.id === id);
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...data,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.push(newProject);
    return newProject;
  }

  async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updatedProject = {
      ...this.projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.projects[index] = updatedProject;
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter((p) => p.id !== id);
    return this.projects.length < initialLength;
  }
}

// Singleton instance
export const db = new MockDB();
