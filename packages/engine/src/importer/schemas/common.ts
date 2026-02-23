import { z } from 'zod';

export const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);

export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #ff00aa');

export const UUIDSchema = z.string().min(1, 'UUID cannot be empty');

export const TransformSchema = z.object({
    position: Vector3Schema,
    rotation: Vector3Schema,
    scale: Vector3Schema,
});

export const BaseActorSchema = z.object({
    id: UUIDSchema,
    name: z.string().min(1),
    transform: TransformSchema,
    visible: z.boolean(),
    locked: z.boolean().optional(),
    description: z.string().optional(),
});
