import { z } from 'zod';
import { ProjectStateSchema } from '@Animatica/engine';

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  state: ProjectStateSchema,
});

export const UpdateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  state: ProjectStateSchema.optional(),
});

export const ExportProjectSchema = z.object({
  projectId: z.string().uuid(),
  format: z.enum(['mp4', 'webm']),
  quality: z.enum(['720p', '1080p', '4k']),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ExportProjectInput = z.infer<typeof ExportProjectSchema>;
