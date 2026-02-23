/**
 * Zod validation schemas for all Actor types.
 * Mirrors the TypeScript interfaces in ../types/index.ts exactly.
 *
 * @module @animatica/engine/schemas
 */
import { z } from 'zod';

// ---- Primitives ----

/**
 * Zod schema for a 3D vector [x, y, z].
 */
export const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);

/**
 * Zod schema for a hex color string.
 */
export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #ff00aa');

/**
 * Zod schema for a UUID v4 string.
 */
export const UUIDSchema = z.string().min(1, 'UUID cannot be empty');

// ---- Transform ----

/**
 * Zod schema for Transform properties (position, rotation, scale).
 */
export const TransformSchema = z.object({
    position: Vector3Schema,
    rotation: Vector3Schema,
    scale: Vector3Schema,
});

// ---- Base Actor ----

/**
 * Zod schema for common properties shared by all actors.
 */
export const BaseActorSchema = z.object({
    id: UUIDSchema,
    name: z.string().min(1),
    transform: TransformSchema,
    visible: z.boolean(),
    locked: z.boolean().optional(),
    description: z.string().optional(),
});

// ---- Character ----

/**
 * Zod schema for character animation states.
 */
export const AnimationStateSchema = z.enum([
    'idle', 'walk', 'run', 'wave', 'talk', 'dance', 'sit', 'jump',
]);

/**
 * Zod schema for morph target influences (0-1).
 */
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

/**
 * Zod schema for body pose configuration.
 */
export const BodyPoseSchema = z.object({
    head: Vector3Schema.optional(),
    spine: Vector3Schema.optional(),
    leftArm: Vector3Schema.optional(),
    rightArm: Vector3Schema.optional(),
    leftLeg: Vector3Schema.optional(),
    rightLeg: Vector3Schema.optional(),
});

/**
 * Zod schema for a clothing item.
 */
export const ClothingItemSchema = z.object({
    type: z.string(),
    color: ColorSchema,
    visible: z.boolean(),
});

/**
 * Zod schema for clothing slots.
 */
export const ClothingSlotsSchema = z.object({
    head: z.array(ClothingItemSchema).optional(),
    torso: z.array(ClothingItemSchema).optional(),
    arms: z.array(ClothingItemSchema).optional(),
    legs: z.array(ClothingItemSchema).optional(),
});

/**
 * Zod schema for a CharacterActor.
 */
export const CharacterActorSchema = BaseActorSchema.extend({
    type: z.literal('character'),
    animation: AnimationStateSchema,
    animationSpeed: z.number().positive().optional(),
    morphTargets: MorphTargetsSchema,
    bodyPose: BodyPoseSchema,
    clothing: ClothingSlotsSchema,
});

// ---- Primitive ----

/**
 * Zod schema for supported primitive shapes.
 */
export const PrimitiveShapeSchema = z.enum([
    'box', 'sphere', 'cylinder', 'plane', 'cone', 'torus', 'capsule',
]);

/**
 * Zod schema for a PrimitiveActor.
 */
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

/**
 * Zod schema for light types.
 */
export const LightTypeSchema = z.enum(['point', 'spot', 'directional']);

/**
 * Zod schema for a LightActor.
 */
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

/**
 * Zod schema for a CameraActor.
 */
export const CameraActorSchema = BaseActorSchema.extend({
    type: z.literal('camera'),
    properties: z.object({
        fov: z.number().min(1).max(180),
        near: z.number().positive(),
        far: z.number().positive(),
    }),
});

// ---- Speaker ----

/**
 * Zod schema for a SpeakerActor.
 */
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

/**
 * Discriminated union schema for any Actor type.
 */
export const ActorSchema = z.discriminatedUnion('type', [
    CharacterActorSchema,
    PrimitiveActorSchema,
    LightActorSchema,
    CameraActorSchema,
    SpeakerActorSchema,
]);
