import { z } from 'zod';
import { BaseActorSchema, ColorSchema } from './common';
import { CharacterActorSchema } from './character';

/**
 * Zod schemas for various actor types and the main Actor union.
 * @module @animatica/engine/importer/schemas
 */

export const PrimitiveShapeSchema = z.enum([
    'box', 'sphere', 'cylinder', 'plane', 'cone', 'torus', 'capsule',
]);

export const PrimitiveActorSchema = BaseActorSchema.extend({
    type: z.literal('primitive'),
    properties: z.object({
        shape: PrimitiveShapeSchema,
        color: ColorSchema,
        roughness: z.number().min(0).max(1),
        metalness: z.number().min(0).max(1),
        opacity: z.number().min(0).max(1),
        wireframe: z.boolean(),
    }),
});

export const LightTypeSchema = z.enum(['point', 'spot', 'directional']);

export const LightActorSchema = BaseActorSchema.extend({
    type: z.literal('light'),
    properties: z.object({
        lightType: LightTypeSchema,
        intensity: z.number().min(0),
        color: ColorSchema,
        castShadow: z.boolean(),
    }),
});

export const CameraActorSchema = BaseActorSchema.extend({
    type: z.literal('camera'),
    properties: z.object({
        fov: z.number().min(1).max(180),
        near: z.number().positive(),
        far: z.number().positive(),
    }),
});

export const SpeakerActorSchema = BaseActorSchema.extend({
    type: z.literal('speaker'),
    properties: z.object({
        audioUrl: z.string().url().optional(),
        volume: z.number().min(0).max(1),
        loop: z.boolean(),
        spatial: z.boolean(),
    }),
});

export const ActorSchema = z.discriminatedUnion('type', [
    CharacterActorSchema,
    PrimitiveActorSchema,
    LightActorSchema,
    CameraActorSchema,
    SpeakerActorSchema,
]);
