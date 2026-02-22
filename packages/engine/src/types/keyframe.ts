import { z } from 'zod';
import { UUIDSchema } from './actor';

export const EasingTypeSchema = z.enum([
  'linear',
  'easeIn',
  'easeOut',
  'easeInOut',
  'step',
]);
export type EasingType = z.infer<typeof EasingTypeSchema>;

export const KeyframeSchema = z.object({
  time: z.number(),
  value: z.unknown(),
  easing: EasingTypeSchema.optional(),
});
// Manually define the generic type to match the interface requirement
export type Keyframe<T = unknown> = Omit<z.infer<typeof KeyframeSchema>, 'value'> & { value: T };

export const AnimationTrackSchema = z.object({
  targetId: UUIDSchema,
  property: z.string(),
  keyframes: z.array(KeyframeSchema),
});
export type AnimationTrack = z.infer<typeof AnimationTrackSchema>;
