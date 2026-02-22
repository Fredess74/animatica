import { z } from 'zod';
import { UUIDSchema } from './common.js';

export const EasingTypeSchema = z.enum([
  'linear',
  'easeIn',
  'easeOut',
  'easeInOut',
  'step',
]);

export const KeyframeSchema = z.object({
  time: z.number().min(0),
  value: z.unknown(),
  easing: EasingTypeSchema.optional(),
});

export const AnimationTrackSchema = z.object({
  targetId: UUIDSchema,
  property: z.string(),
  keyframes: z.array(KeyframeSchema),
});

export const TransitionTypeSchema = z.enum(['cut', 'dissolve', 'fade']);

export const CameraCutSchema = z.object({
  id: UUIDSchema,
  time: z.number().min(0),
  cameraId: UUIDSchema,
  transition: TransitionTypeSchema,
  transitionDuration: z.number().min(0),
});

export const TimelineSchema = z.object({
  duration: z.number().min(0),
  cameraTrack: z.array(CameraCutSchema),
  animationTracks: z.array(AnimationTrackSchema),
});
