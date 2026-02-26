import { z } from 'zod';
import { BaseActorSchema, Vector3Schema, ColorSchema } from './common';

/**
 * Zod schemas for character actors and their specific properties.
 * @module @animatica/engine/importer/schemas
 */

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
    animation: AnimationStateSchema,
    animationSpeed: z.number().positive().optional(),
    morphTargets: MorphTargetsSchema,
    bodyPose: BodyPoseSchema,
    clothing: ClothingSlotsSchema,
});
