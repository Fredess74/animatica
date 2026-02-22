import { z } from 'zod';
import { UUIDSchema, ActorSchema } from './actor';
import { AnimationTrackSchema } from './keyframe';
import { EnvironmentSchema } from './environment';

export const TransitionTypeSchema = z.enum(['cut', 'dissolve', 'fade']);
export type TransitionType = z.infer<typeof TransitionTypeSchema>;

export const CameraCutSchema = z.object({
  id: UUIDSchema,
  time: z.number(),
  cameraId: UUIDSchema,
  transition: TransitionTypeSchema,
  transitionDuration: z.number(),
});
export type CameraCut = z.infer<typeof CameraCutSchema>;

export const TimelineSchema = z.object({
  duration: z.number(),
  cameraTrack: z.array(CameraCutSchema),
  animationTracks: z.array(AnimationTrackSchema),
});
export type Timeline = z.infer<typeof TimelineSchema>;

export const ProjectMetaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  version: z.string(),
  author: z.string().optional(),
});
export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

export const ProjectStateSchema = z.object({
  meta: ProjectMetaSchema,
  environment: EnvironmentSchema,
  actors: z.array(ActorSchema),
  timeline: TimelineSchema,
  library: z.object({
    clips: z.array(z.unknown()),
  }),
});
export type ProjectState = z.infer<typeof ProjectStateSchema>;

export const ValidationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  data: ProjectStateSchema.optional(),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
