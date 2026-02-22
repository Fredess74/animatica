import { z } from 'zod'
import { ActorSchema } from './actor'
import { EnvironmentSchema } from './environment'
import { TimelineSchema } from './timeline'

export const ProjectMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semver like 1.0.0'),
  author: z.string().optional(),
})

export const ProjectStateSchema = z.object({
  meta: ProjectMetaSchema,
  environment: EnvironmentSchema,
  actors: z.array(ActorSchema),
  timeline: TimelineSchema,
  library: z.object({
    clips: z.array(z.unknown()),
  }),
})

export const ValidationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  data: ProjectStateSchema.optional(),
})
