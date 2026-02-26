import { z } from 'zod';
import { UUIDSchema, ColorSchema } from './common';

/**
 * Zod schemas for timeline and animation tracks.
 * @module @animatica/engine/importer/schemas
 */

export const EasingTypeSchema = z.enum([
    'linear', 'easeIn', 'easeOut', 'easeInOut', 'step',
]);

export const KeyframeSchema = z.object({
    time: z.number().min(0),
    value: z.unknown(),
    easing: EasingTypeSchema.optional(),
});

export const AnimationTrackSchema = z.object({
    targetId: UUIDSchema,
    property: z.string().min(1),
    keyframes: z.array(KeyframeSchema).min(1),
});

export const TransitionTypeSchema = z.enum(['cut', 'dissolve', 'fade']);

export const CameraCutSchema = z.object({
    id: UUIDSchema,
    time: z.number().min(0),
    cameraId: UUIDSchema,
    transition: TransitionTypeSchema,
    transitionDuration: z.number().min(0),
});

export const MarkerSchema = z.object({
    id: UUIDSchema,
    time: z.number().min(0),
    label: z.string(),
    color: ColorSchema,
});

export const TimelineSchema = z.object({
    duration: z.number().positive(),
    cameraTrack: z.array(CameraCutSchema),
    animationTracks: z.array(AnimationTrackSchema),
    markers: z.array(MarkerSchema),
});
