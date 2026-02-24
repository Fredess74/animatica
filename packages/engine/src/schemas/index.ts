/**
 * Public API for all Zod validation schemas.
 * @module @animatica/engine/schemas
 */
export {
    // Primitives
    Vector3Schema,
    ColorSchema,
    UUIDSchema,
    TransformSchema,
    // Character
    AnimationStateSchema,
    MorphTargetsSchema,
    BodyPoseSchema,
    ClothingItemSchema,
    ClothingSlotsSchema,
    CharacterActorSchema,
    // Primitive
    PrimitiveShapeSchema,
    PrimitiveActorSchema,
    // Light
    LightTypeSchema,
    LightActorSchema,
    // Camera
    CameraActorSchema,
    // Speaker
    SpeakerActorSchema,
    // Union
    ActorSchema,
    // Base
    BaseActorSchema,
} from './actor.schema';

export {
    // Timeline
    EasingTypeSchema,
    KeyframeSchema,
    AnimationTrackSchema,
    TransitionTypeSchema,
    CameraCutSchema,
    TimelineSchema,
    // Environment
    WeatherTypeSchema,
    WeatherSchema,
    FogSchema,
    EnvironmentSchema,
    // Project
    ProjectMetaSchema,
    ProjectStateSchema,
    ValidationResultSchema,
} from './scene.schema';
