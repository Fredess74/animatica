import { z } from 'zod';
import { ColorSchema, Vector3Schema } from './actor';

export const WeatherTypeSchema = z.enum(['none', 'rain', 'snow', 'dust']);
export type WeatherType = z.infer<typeof WeatherTypeSchema>;

export const WeatherSchema = z.object({
  type: WeatherTypeSchema,
  intensity: z.number().min(0).max(1),
});
export type Weather = z.infer<typeof WeatherSchema>;

export const FogSchema = z.object({
  color: ColorSchema,
  near: z.number(),
  far: z.number(),
});
export type Fog = z.infer<typeof FogSchema>;

export const EnvironmentSchema = z.object({
  ambientLight: z.object({
    intensity: z.number(),
    color: ColorSchema,
  }),
  sun: z.object({
    position: Vector3Schema,
    intensity: z.number(),
    color: ColorSchema,
  }),
  skyColor: ColorSchema,
  fog: FogSchema.optional(),
  weather: WeatherSchema.optional(),
});
export type Environment = z.infer<typeof EnvironmentSchema>;
