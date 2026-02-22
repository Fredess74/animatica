import { z } from 'zod';
import { EnvironmentSchema } from './environment.js';
import { ActorSchema } from './actor.js';
import { TimelineSchema } from './timeline.js';

export const ProjectMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  version: z.string(),
  author: z.string().optional(),
});

export const ProjectStateSchema = z.object({
  meta: ProjectMetaSchema,
  environment: EnvironmentSchema,
  actors: z.array(ActorSchema),
  timeline: TimelineSchema,
  library: z.object({
    clips: z.array(z.unknown()),
  }),
});

export const ValidationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  data: ProjectStateSchema.optional(),
});
