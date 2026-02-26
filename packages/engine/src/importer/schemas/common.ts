import { z } from 'zod';

/**
 * Common Zod schemas used across different engine modules.
 * @module @animatica/engine/importer/schemas
 */

/**
 * Zod schema for a 3D vector [x, y, z].
 */
export const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);

/**
 * Zod schema for a hex color string (e.g., "#ff00aa").
 */
export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #ff00aa');

/**
 * Zod schema for a UUID string.
 */
export const UUIDSchema = z.string().min(1, 'UUID cannot be empty');

/**
 * Zod schema for object transformation (position, rotation, scale).
 */
export const TransformSchema = z.object({
    position: Vector3Schema,
    rotation: Vector3Schema,
    scale: Vector3Schema,
});

/**
 * Base Zod schema for shared actor properties.
 */
export const BaseActorSchema = z.object({
    id: UUIDSchema,
    name: z.string().min(1),
    transform: TransformSchema,
    visible: z.boolean(),
    locked: z.boolean().optional(),
    description: z.string().optional(),
});
