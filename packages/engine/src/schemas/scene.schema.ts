/**
 * Zod validation schemas for Timeline, Environment, and ProjectState.
 *
 * @module @animatica/engine/schemas
 */
import { z } from 'zod';
import {
    Vector3Schema,
    ColorSchema,
    UUIDSchema,
    ActorSchema,
} from './actor.schema';

// ---- Timeline ----

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

export const TimelineSchema = z.object({
    duration: z.number().positive(),
    cameraTrack: z.array(CameraCutSchema),
    animationTracks: z.array(AnimationTrackSchema),
});

// ---- Environment ----

export const WeatherTypeSchema = z.enum(['none', 'rain', 'snow', 'dust']);

export const WeatherSchema = z.object({
    type: WeatherTypeSchema,
    intensity: z.number().min(0).max(1),
});

export const FogSchema = z.object({
    color: ColorSchema,
    near: z.number().min(0),
    far: z.number().positive(),
});

export const EnvironmentSchema = z.object({
    ambientLight: z.object({
        intensity: z.number().min(0),
        color: ColorSchema,
    }),
    sun: z.object({
        position: Vector3Schema,
        intensity: z.number().min(0),
        color: ColorSchema,
    }),
    skyColor: ColorSchema,
    fog: FogSchema.optional(),
    weather: WeatherSchema.optional(),
});

// ---- Project ----

export const ProjectMetaSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semver like 1.0.0'),
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
