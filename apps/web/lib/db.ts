import { ProjectState } from '@Animatica/engine';
import { randomUUID } from 'crypto';

export interface DbProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  state: ProjectState;
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
}

// Mock Data Store
const projects: DbProject[] = [];
const users: DbUser[] = [
  { id: 'user-1', email: 'user@example.com', name: 'Demo User' },
];

export const getProjects = async (userId?: string): Promise<DbProject[]> => {
  if (userId) {
    return projects.filter((p) => p.userId === userId);
  }
  return projects;
};

export const getProjectById = async (id: string): Promise<DbProject | undefined> => {
  return projects.find((p) => p.id === id);
};

export const createProject = async (
  userId: string,
  state: ProjectState
): Promise<DbProject> => {
  const newProject: DbProject = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId,
    state,
  };
  projects.push(newProject);
  return newProject;
};

export const updateProject = async (
  id: string,
  updates: Partial<ProjectState>
): Promise<DbProject | undefined> => {
  const projectIndex = projects.findIndex((p) => p.id === id);
  if (projectIndex === -1) return undefined;

  const currentProject = projects[projectIndex];
  const updatedProject = {
    ...currentProject,
    state: { ...currentProject.state, ...updates },
    updatedAt: new Date().toISOString(),
  };
  projects[projectIndex] = updatedProject;
  return updatedProject;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const projectIndex = projects.findIndex((p) => p.id === id);
  if (projectIndex === -1) return false;
  projects.splice(projectIndex, 1);
  return true;
};

export const getUser = async (email: string): Promise<DbUser | undefined> => {
  return users.find((u) => u.email === email);
};

export const getUserById = async (id: string): Promise<DbUser | undefined> => {
  return users.find((u) => u.id === id);
};
