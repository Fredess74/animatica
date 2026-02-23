import { ProjectState } from '@Animatica/engine';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  state: ProjectState;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

const demoProject: Project = {
  id: '1',
  userId: 'user-1',
  name: 'Demo Project',
  description: 'A simple demo project',
  state: {
    meta: {
      title: 'Demo Project',
      version: '1.0.0',
    },
    environment: {
      ambientLight: { intensity: 0.5, color: '#ffffff' },
      sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
      skyColor: '#87ceeb',
    },
    actors: [],
    timeline: {
      duration: 10,
      cameraTrack: [],
      animationTracks: [],
    },
    library: { clips: [] },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Initial mock data
const projects: Project[] = [demoProject];

export const db = {
  projects: {
    findMany: async () => [...projects],
    findUnique: async (id: string) => projects.find((p) => p.id === id) || null,
    create: async (data: CreateProjectInput) => {
      const newProject: Project = {
        ...data,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      projects.push(newProject);
      return newProject;
    },
    update: async (id: string, data: Partial<Project>) => {
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      projects[index] = { ...projects[index], ...data, updatedAt: new Date().toISOString() };
      return projects[index];
    },
    delete: async (id: string) => {
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      const deleted = projects[index];
      projects.splice(index, 1);
      return deleted;
    },
  },
};
