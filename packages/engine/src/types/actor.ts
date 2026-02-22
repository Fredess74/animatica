import { z } from 'zod';

export const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vector3 = z.infer<typeof Vector3Schema>;

export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
export type Color = z.infer<typeof ColorSchema>;

export const UUIDSchema = z.string().uuid();
export type UUID = z.infer<typeof UUIDSchema>;

export const TransformSchema = z.object({
  position: Vector3Schema,
  rotation: Vector3Schema,
  scale: Vector3Schema,
});
export type Transform = z.infer<typeof TransformSchema>;

export const BaseActorSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  transform: TransformSchema,
  visible: z.boolean(),
});
export type BaseActor = z.infer<typeof BaseActorSchema>;

// ---- Character ----
export const AnimationStateSchema = z.enum([
  'idle',
  'walk',
  'run',
  'wave',
  'talk',
  'dance',
  'sit',
  'jump',
]);
export type AnimationState = z.infer<typeof AnimationStateSchema>;

export const MorphTargetsSchema = z.object({
  mouthSmile: z.number().optional(),
  mouthOpen: z.number().optional(),
  jawOpen: z.number().optional(),
  browInnerUp: z.number().optional(),
  eyeBlinkLeft: z.number().optional(),
  eyeBlinkRight: z.number().optional(),
  eyeSquintLeft: z.number().optional(),
  eyeSquintRight: z.number().optional(),
  noseSneerLeft: z.number().optional(),
  noseSneerRight: z.number().optional(),
});
export type MorphTargets = z.infer<typeof MorphTargetsSchema>;

export const BodyPoseSchema = z.object({
  head: Vector3Schema.optional(),
  spine: Vector3Schema.optional(),
  leftArm: Vector3Schema.optional(),
  rightArm: Vector3Schema.optional(),
  leftLeg: Vector3Schema.optional(),
  rightLeg: Vector3Schema.optional(),
});
export type BodyPose = z.infer<typeof BodyPoseSchema>;

export const ClothingItemSchema = z.object({
  type: z.string(),
  color: ColorSchema,
  visible: z.boolean(),
});
export type ClothingItem = z.infer<typeof ClothingItemSchema>;

export const ClothingSlotsSchema = z.object({
  head: z.array(ClothingItemSchema).optional(),
  torso: z.array(ClothingItemSchema).optional(),
  arms: z.array(ClothingItemSchema).optional(),
  legs: z.array(ClothingItemSchema).optional(),
});
export type ClothingSlots = z.infer<typeof ClothingSlotsSchema>;

export const CharacterActorSchema = BaseActorSchema.extend({
  type: z.literal('character'),
  animation: AnimationStateSchema,
  animationSpeed: z.number().optional(),
  morphTargets: MorphTargetsSchema,
  bodyPose: BodyPoseSchema,
  clothing: ClothingSlotsSchema,
});
export type CharacterActor = z.infer<typeof CharacterActorSchema>;

// ---- Primitive ----
export const PrimitiveShapeSchema = z.enum([
  'box',
  'sphere',
  'cylinder',
  'plane',
  'cone',
  'torus',
  'capsule',
]);
export type PrimitiveShape = z.infer<typeof PrimitiveShapeSchema>;

export const PrimitiveActorSchema = BaseActorSchema.extend({
  type: z.literal('primitive'),
  properties: z.object({
    shape: PrimitiveShapeSchema,
    color: ColorSchema,
    roughness: z.number(),
    metalness: z.number(),
  }),
});
export type PrimitiveActor = z.infer<typeof PrimitiveActorSchema>;

// ---- Light ----
export const LightTypeSchema = z.enum(['point', 'spot', 'directional']);
export type LightType = z.infer<typeof LightTypeSchema>;

export const LightActorSchema = BaseActorSchema.extend({
  type: z.literal('light'),
  properties: z.object({
    lightType: LightTypeSchema,
    intensity: z.number(),
    color: ColorSchema,
    castShadow: z.boolean(),
  }),
});
export type LightActor = z.infer<typeof LightActorSchema>;

// ---- Camera ----
export const CameraActorSchema = BaseActorSchema.extend({
  type: z.literal('camera'),
  properties: z.object({
    fov: z.number(),
    near: z.number(),
    far: z.number(),
  }),
});
export type CameraActor = z.infer<typeof CameraActorSchema>;

// ---- Speaker (Audio) ----
export const SpeakerActorSchema = BaseActorSchema.extend({
  type: z.literal('speaker'),
  properties: z.object({
    audioUrl: z.string().optional(),
    volume: z.number(),
    loop: z.boolean(),
    spatial: z.boolean(),
  }),
});
export type SpeakerActor = z.infer<typeof SpeakerActorSchema>;

// ---- Union ----
export const ActorSchema = z.discriminatedUnion('type', [
  CharacterActorSchema,
  PrimitiveActorSchema,
  LightActorSchema,
  CameraActorSchema,
  SpeakerActorSchema,
]);
export type Actor = z.infer<typeof ActorSchema>;
