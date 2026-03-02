import { z } from 'zod';
import { Vector3Schema, ColorSchema } from './common';

/**
 * Zod schemas for scene environment settings.
 * @module @Animatica/engine/importer/schemas
 */

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
