import { z } from 'zod';
import { UUIDSchema, TransformSchema, ColorSchema } from './common.js';
import {
  AnimationStateSchema,
  MorphTargetsSchema,
  BodyPoseSchema,
  ClothingSlotsSchema,
} from './character.js';

const BaseActorSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  transform: TransformSchema,
  visible: z.boolean(),
});

export const CharacterActorSchema = BaseActorSchema.extend({
  type: z.literal('character'),
  animation: AnimationStateSchema,
  animationSpeed: z.number().optional(),
  morphTargets: MorphTargetsSchema,
  bodyPose: BodyPoseSchema,
  clothing: ClothingSlotsSchema,
});

export const PrimitiveShapeSchema = z.enum([
  'box',
  'sphere',
  'cylinder',
  'plane',
  'cone',
  'torus',
  'capsule',
]);

export const PrimitiveActorSchema = BaseActorSchema.extend({
  type: z.literal('primitive'),
  properties: z.object({
    shape: PrimitiveShapeSchema,
    color: ColorSchema,
    roughness: z.number().min(0).max(1),
    metalness: z.number().min(0).max(1),
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
    near: z.number().min(0.001),
    far: z.number().min(1),
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
