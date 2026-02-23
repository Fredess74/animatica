/**
 * Public API for all Zod validation schemas.
 * @module @animatica/engine/schemas
 */
export {
  // Union
  ActorSchema,
  // Character
  AnimationStateSchema,
  // Base
  BaseActorSchema,
  BodyPoseSchema,
  // Camera
  CameraActorSchema,
  CharacterActorSchema,
  ClothingItemSchema,
  ClothingSlotsSchema,
  ColorSchema,
  LightActorSchema,
  // Light
  LightTypeSchema,
  MorphTargetsSchema,
  PrimitiveActorSchema,
  // Primitive
  PrimitiveShapeSchema,
  // Speaker
  SpeakerActorSchema,
  TransformSchema,
  UUIDSchema,
  // Primitives
  Vector3Schema,
} from './actor.schema'
export {
  AnimationTrackSchema,
  CameraCutSchema,
  // Timeline
  EasingTypeSchema,
  EnvironmentSchema,
  FogSchema,
  KeyframeSchema,
  // Project
  ProjectMetaSchema,
  ProjectStateSchema,
  TimelineSchema,
  TransitionTypeSchema,
  WeatherSchema,
  // Environment
  WeatherTypeSchema,
} from './scene.schema'
