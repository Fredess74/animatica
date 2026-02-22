import { z } from 'zod';
import { ColorSchema, Vector3Schema } from './common.js';

export const WeatherTypeSchema = z.enum(['none', 'rain', 'snow', 'dust']);

export const WeatherSchema = z.object({
  type: WeatherTypeSchema,
  intensity: z.number().min(0).max(1),
});

export const FogSchema = z.object({
  color: ColorSchema,
  near: z.number().min(0),
  far: z.number().min(0),
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
