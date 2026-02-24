/**
 * Zod validation schemas for all Actor types.
 * Mirrors the TypeScript interfaces in ../types/index.ts exactly.
 *
 * @module @animatica/engine/schemas
 */
import { z } from 'zod';

// ---- Primitives ----

export const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);

export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #ff00aa');

export const UUIDSchema = z.string().min(1, 'UUID cannot be empty');

// ---- Transform ----

export const TransformSchema = z.object({
    position: Vector3Schema,
    rotation: Vector3Schema,
    scale: Vector3Schema,
});

// ---- Base Actor ----

export const BaseActorSchema = z.object({
    id: UUIDSchema,
    name: z.string().min(1),
    transform: TransformSchema,
    visible: z.boolean(),
    locked: z.boolean().optional(),
    description: z.string().optional(),
});

// ---- Character ----

export const AnimationStateSchema = z.enum([
    'idle', 'walk', 'run', 'wave', 'talk', 'dance', 'sit', 'jump',
]);

export const MorphTargetsSchema = z.object({
    mouthSmile: z.number().min(0).max(1).optional(),
    mouthOpen: z.number().min(0).max(1).optional(),
    jawOpen: z.number().min(0).max(1).optional(),
    browInnerUp: z.number().min(0).max(1).optional(),
    eyeBlinkLeft: z.number().min(0).max(1).optional(),
    eyeBlinkRight: z.number().min(0).max(1).optional(),
    eyeSquintLeft: z.number().min(0).max(1).optional(),
    eyeSquintRight: z.number().min(0).max(1).optional(),
    noseSneerLeft: z.number().min(0).max(1).optional(),
    noseSneerRight: z.number().min(0).max(1).optional(),
});

export const BodyPoseSchema = z.object({
    head: Vector3Schema.optional(),
    spine: Vector3Schema.optional(),
    leftArm: Vector3Schema.optional(),
    rightArm: Vector3Schema.optional(),
    leftLeg: Vector3Schema.optional(),
    rightLeg: Vector3Schema.optional(),
});

export const ClothingItemSchema = z.object({
    type: z.string(),
    color: ColorSchema,
    visible: z.boolean(),
});

export const ClothingSlotsSchema = z.object({
    head: z.array(ClothingItemSchema).optional(),
    torso: z.array(ClothingItemSchema).optional(),
    arms: z.array(ClothingItemSchema).optional(),
    legs: z.array(ClothingItemSchema).optional(),
});

export const CharacterActorSchema = BaseActorSchema.extend({
    type: z.literal('character'),
    modelUrl: z.string().url().optional(),
    animation: AnimationStateSchema,
    animationSpeed: z.number().positive().optional(),
    morphTargets: MorphTargetsSchema,
    bodyPose: BodyPoseSchema,
    clothing: ClothingSlotsSchema,
});

// ---- Primitive ----

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

// ---- Light ----

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

// ---- Camera ----

export const CameraActorSchema = BaseActorSchema.extend({
    type: z.literal('camera'),
    properties: z.object({
        fov: z.number().min(1).max(180),
        near: z.number().positive(),
        far: z.number().positive(),
    }),
});

// ---- Speaker ----

export const SpeakerActorSchema = BaseActorSchema.extend({
    type: z.literal('speaker'),
    properties: z.object({
        audioUrl: z.string().url().optional(),
        volume: z.number().min(0).max(1),
        loop: z.boolean(),
        spatial: z.boolean(),
    }),
});

// ---- Union ----

export const ActorSchema = z.discriminatedUnion('type', [
    CharacterActorSchema,
    PrimitiveActorSchema,
    LightActorSchema,
    CameraActorSchema,
    SpeakerActorSchema,
]);
