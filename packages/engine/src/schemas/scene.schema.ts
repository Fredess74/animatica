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

/**
 * Zod schema for easing function types.
 */
export const EasingTypeSchema = z.enum([
    'linear', 'easeIn', 'easeOut', 'easeInOut', 'step',
]);

/**
 * Zod schema for a single animation keyframe.
 */
export const KeyframeSchema = z.object({
    time: z.number().min(0),
    value: z.unknown(),
    easing: EasingTypeSchema.optional(),
});

/**
 * Zod schema for an animation track targeting an actor property.
 */
export const AnimationTrackSchema = z.object({
    targetId: UUIDSchema,
    property: z.string().min(1),
    keyframes: z.array(KeyframeSchema).min(1),
});

/**
 * Zod schema for camera transition types.
 */
export const TransitionTypeSchema = z.enum(['cut', 'dissolve', 'fade']);

/**
 * Zod schema for a camera cut event.
 */
export const CameraCutSchema = z.object({
    id: UUIDSchema,
    time: z.number().min(0),
    cameraId: UUIDSchema,
    transition: TransitionTypeSchema,
    transitionDuration: z.number().min(0),
});

/**
 * Zod schema for the complete scene timeline.
 */
export const TimelineSchema = z.object({
    duration: z.number().positive(),
    cameraTrack: z.array(CameraCutSchema),
    animationTracks: z.array(AnimationTrackSchema),
});

// ---- Environment ----

/**
 * Zod schema for weather types.
 */
export const WeatherTypeSchema = z.enum(['none', 'rain', 'snow', 'dust']);

/**
 * Zod schema for weather configuration.
 */
export const WeatherSchema = z.object({
    type: WeatherTypeSchema,
    intensity: z.number().min(0).max(1),
});

/**
 * Zod schema for fog configuration.
 */
export const FogSchema = z.object({
    color: ColorSchema,
    near: z.number().min(0),
    far: z.number().positive(),
});

/**
 * Zod schema for the scene environment settings.
 */
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

/**
 * Zod schema for project metadata.
 */
export const ProjectMetaSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semver like 1.0.0'),
    author: z.string().optional(),
});

/**
 * Zod schema for the complete ProjectState.
 * Can be used to validate an entire scene file.
 */
export const ProjectStateSchema = z.object({
    meta: ProjectMetaSchema,
    environment: EnvironmentSchema,
    actors: z.array(ActorSchema),
    timeline: TimelineSchema,
    library: z.object({
        clips: z.array(z.unknown()),
    }),
});
