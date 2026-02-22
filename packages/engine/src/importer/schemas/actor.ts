import { z } from 'zod'
import {
  ColorSchema,
  TransformSchema,
  UUIDSchema,
  Vector3Schema,
} from './common'
import {
  AnimationStateSchema,
  BodyPoseSchema,
  ClothingSlotsSchema,
  MorphTargetsSchema,
} from './character'

const BaseActorSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1),
  transform: TransformSchema,
  visible: z.boolean(),
  locked: z.boolean().optional(),
  description: z.string().optional(),
})

export const PrimitiveShapeSchema = z.enum([
  'box',
  'sphere',
  'cylinder',
  'plane',
  'cone',
  'torus',
  'capsule',
])

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
})

export const LightTypeSchema = z.enum(['point', 'spot', 'directional'])

export const LightActorSchema = BaseActorSchema.extend({
  type: z.literal('light'),
  properties: z.object({
    lightType: LightTypeSchema,
    intensity: z.number().min(0),
    color: ColorSchema,
    castShadow: z.boolean(),
  }),
})

export const CameraActorSchema = BaseActorSchema.extend({
  type: z.literal('camera'),
  properties: z.object({
    fov: z.number().min(1).max(180),
    near: z.number().positive(),
    far: z.number().positive(),
  }),
})

export const SpeakerActorSchema = BaseActorSchema.extend({
  type: z.literal('speaker'),
  properties: z.object({
    audioUrl: z.string().url().optional(),
    volume: z.number().min(0).max(1),
    loop: z.boolean(),
    spatial: z.boolean(),
  }),
})

export const CharacterActorSchema = BaseActorSchema.extend({
  type: z.literal('character'),
  animation: AnimationStateSchema,
  animationSpeed: z.number().positive().optional(),
  morphTargets: MorphTargetsSchema,
  bodyPose: BodyPoseSchema,
  clothing: ClothingSlotsSchema,
})

export const ActorSchema = z.discriminatedUnion('type', [
  PrimitiveActorSchema,
  LightActorSchema,
  CameraActorSchema,
  SpeakerActorSchema,
  CharacterActorSchema,
])
