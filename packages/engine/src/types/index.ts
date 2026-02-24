/**
 * Core type definitions for the Animatica Engine.
 * This module exports all data models, interfaces, and utility types used throughout the engine.
 * @module @animatica/engine/types
 */

/**
 * A 3D vector represented as a tuple of three numbers [x, y, z].
 */
export type Vector3 = [number, number, number]

/**
 * A color string in hexadecimal format (e.g., "#ff00aa").
 */
export type Color = string

/**
 * A unique identifier string (UUID v4).
 */
export type UUID = string

/**
 * Represents the transformation properties of an object in 3D space.
 */
export interface Transform {
  /** The position of the object as [x, y, z]. */
  position: Vector3
  /** The rotation of the object as Euler angles in radians [x, y, z]. */
  rotation: Vector3
  /** The scale of the object as [x, y, z]. */
  scale: Vector3
}

/**
 * Base interface for all actors in the scene.
 */
export interface BaseActor {
  /** Unique identifier for the actor. */
  id: UUID
  /** Human-readable name of the actor. */
  name: string
  /** The actor's transformation in 3D space. */
  transform: Transform
  /** Whether the actor is visible in the scene. */
  visible: boolean
  /**
   * UX Enhancement: Prevents accidental selection/edits in editor.
   * Useful for background elements or completed parts of the scene.
   */
  locked?: boolean
  /**
   * UX Enhancement: Description for accessibility and organization.
   * Can be used as alt text or tooltip content in the editor.
   */
  description?: string
}

// ---- Character ----

/**
 * Available animation states for a character.
 */
export type AnimationState = 'idle' | 'walk' | 'run' | 'wave' | 'talk' | 'dance' | 'sit' | 'jump'

/**
 * Morph target influences for facial expressions.
 * Values range from 0 (neutral) to 1 (fully applied).
 */
export interface MorphTargets {
  /** Smile intensity (0-1). */
  mouthSmile?: number
  /** Mouth open intensity (0-1). */
  mouthOpen?: number
  /** Jaw open intensity (0-1). */
  jawOpen?: number
  /** Inner brow raise intensity (0-1). */
  browInnerUp?: number
  /** Left eye blink intensity (0-1). */
  eyeBlinkLeft?: number
  /** Right eye blink intensity (0-1). */
  eyeBlinkRight?: number
  /** Left eye squint intensity (0-1). */
  eyeSquintLeft?: number
  /** Right eye squint intensity (0-1). */
  eyeSquintRight?: number
  /** Left nose sneer intensity (0-1). */
  noseSneerLeft?: number
  /** Right nose sneer intensity (0-1). */
  noseSneerRight?: number
}

/**
 * Body pose configuration defining rotation for specific body parts.
 */
export interface BodyPose {
  /** Rotation for the head. */
  head?: Vector3
  /** Rotation for the spine. */
  spine?: Vector3
  /** Rotation for the left arm. */
  leftArm?: Vector3
  /** Rotation for the right arm. */
  rightArm?: Vector3
  /** Rotation for the left leg. */
  leftLeg?: Vector3
  /** Rotation for the right leg. */
  rightLeg?: Vector3
}

/**
 * Represents a single clothing item.
 */
export interface ClothingItem {
  /** The type/model of the clothing item (e.g., 'hat', 'jacket'). */
  type: string
  /** The color of the clothing item. */
  color: Color
  /** Whether the clothing item is visible. */
  visible: boolean
}

/**
 * Slots for equipping clothing items on a character.
 */
export interface ClothingSlots {
  /** Items equipped on the head. */
  head?: ClothingItem[]
  /** Items equipped on the torso. */
  torso?: ClothingItem[]
  /** Items equipped on the arms. */
  arms?: ClothingItem[]
  /** Items equipped on the legs. */
  legs?: ClothingItem[]
}

/**
 * Represents a character actor in the scene.
 */
export interface CharacterActor extends BaseActor {
  /** Discriminator for the actor type. */
  type: 'character'
  /** URL of the 3D model (GLB/ReadyPlayerMe). */
  modelUrl?: string
  /** Current animation state. */
  animation: AnimationState
  /** Speed multiplier for the animation (default: 1). */
  animationSpeed?: number
  /** Facial expression morph targets. */
  morphTargets: MorphTargets
  /** Custom body pose overrides. */
  bodyPose: BodyPose
  /** Equipped clothing items. */
  clothing: ClothingSlots
}

// ---- Primitive ----

/**
 * Supported primitive shapes.
 */
export type PrimitiveShape = 'box' | 'sphere' | 'cylinder' | 'plane' | 'cone' | 'torus' | 'capsule'

/**
 * Represents a primitive geometry actor.
 */
export interface PrimitiveActor extends BaseActor {
  /** Discriminator for the actor type. */
  type: 'primitive'
  /** Properties specific to the primitive shape and material. */
  properties: {
    /** The geometric shape of the primitive. */
    shape: PrimitiveShape
    /** The color of the material. */
    color: Color
    /** Material roughness (0-1). */
    roughness: number
    /** Material metalness (0-1). */
    metalness: number
    /** Material opacity (0-1). */
    opacity: number
    /** Whether to render in wireframe mode. */
    wireframe: boolean
  }
}

// ---- Light ----

/**
 * Supported light types.
 */
export type LightType = 'point' | 'spot' | 'directional'

/**
 * Represents a light source actor.
 */
export interface LightActor extends BaseActor {
  /** Discriminator for the actor type. */
  type: 'light'
  /** Properties specific to the light source. */
  properties: {
    /** The type of light source. */
    lightType: LightType
    /** Light intensity. */
    intensity: number
    /** Light color. */
    color: Color
    /** Whether the light casts shadows. */
    castShadow: boolean
  }
}

// ---- Camera ----

/**
 * Represents a camera actor.
 */
export interface CameraActor extends BaseActor {
  /** Discriminator for the actor type. */
  type: 'camera'
  /** Properties specific to the camera. */
  properties: {
    /** Field of view in degrees. */
    fov: number
    /** Near clipping plane distance. */
    near: number
    /** Far clipping plane distance. */
    far: number
  }
}

// ---- Speaker (Audio) ----

/**
 * Represents an audio source actor.
 */
export interface SpeakerActor extends BaseActor {
  /** Discriminator for the actor type. */
  type: 'speaker'
  /** Properties specific to the audio source. */
  properties: {
    /** URL of the audio file. */
    audioUrl?: string
    /** Audio volume (0-1). */
    volume: number
    /** Whether the audio should loop. */
    loop: boolean
    /** Whether the audio is spatial (3D). */
    spatial: boolean
  }
}

// ---- Union ----

/**
 * Union type of all possible actor interfaces.
 */
export type Actor = CharacterActor | PrimitiveActor | LightActor | CameraActor | SpeakerActor

// ---- Timeline ----

/**
 * Supported easing functions for animation interpolation.
 */
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'step'

/**
 * A single keyframe in an animation track.
 * @template T The type of value being animated.
 */
export interface Keyframe<T = unknown> {
  /** Time of the keyframe in seconds. */
  time: number
  /** Value at this keyframe. */
  value: T
  /** Easing function to use when interpolating to the next keyframe. */
  easing?: EasingType
}

/**
 * An animation track targeting a specific property of an actor.
 */
export interface AnimationTrack {
  /** ID of the target actor. */
  targetId: UUID
  /** Dot-notation path to the property being animated (e.g., 'transform.position'). */
  property: string
  /** Array of keyframes for this property. */
  keyframes: Keyframe[]
}

/**
 * Supported camera transition types.
 */
export type TransitionType = 'cut' | 'dissolve' | 'fade'

/**
 * Defines a camera cut event on the timeline.
 */
export interface CameraCut {
  /** Unique ID for the cut event. */
  id: UUID
  /** Time when the cut occurs (in seconds). */
  time: number
  /** ID of the camera to switch to. */
  cameraId: UUID
  /** Type of transition to this camera. */
  transition: TransitionType
  /** Duration of the transition in seconds. */
  transitionDuration: number
}

/**
 * The complete timeline configuration for the scene.
 */
export interface Timeline {
  /** Total duration of the scene in seconds. */
  duration: number
  /** Sequence of camera cuts. */
  cameraTrack: CameraCut[]
  /** Collection of animation tracks for actors. */
  animationTracks: AnimationTrack[]
}

// ---- Environment ----

/**
 * Supported weather types.
 */
export type WeatherType = 'none' | 'rain' | 'snow' | 'dust'

/**
 * Weather configuration.
 */
export interface Weather {
  /** The type of weather effect. */
  type: WeatherType
  /** Intensity of the weather effect (0-1). */
  intensity: number
}

/**
 * Fog configuration.
 */
export interface Fog {
  /** Fog color. */
  color: Color
  /** Distance where fog starts. */
  near: number
  /** Distance where fog is fully opaque. */
  far: number
}

/**
 * Scene environment configuration.
 */
export interface Environment {
  /** Ambient light settings. */
  ambientLight: { intensity: number; color: Color }
  /** Sun (directional light) settings. */
  sun: { position: Vector3; intensity: number; color: Color }
  /** Background sky color. */
  skyColor: Color
  /** Optional fog settings. */
  fog?: Fog
  /** Optional weather settings. */
  weather?: Weather
}

// ---- Project ----

/**
 * Metadata for the project.
 */
export interface ProjectMeta {
  /** Title of the project. */
  title: string
  /** Description of the project. */
  description?: string
  /** Project version string (semver). */
  version: string
  /** Author name. */
  author?: string
}

/**
 * The complete state of a project, including all actors, timeline, and environment settings.
 */
export interface ProjectState {
  /** Project metadata. */
  meta: ProjectMeta
  /** Environment settings. */
  environment: Environment
  /** List of actors in the scene. */
  actors: Actor[]
  /** Animation and camera timeline. */
  timeline: Timeline
  /** Asset library (unused currently). */
  library: { clips: unknown[] }
}

/**
 * Result of a project validation operation.
 */
export interface ValidationResult {
  /** Whether the validation was successful. */
  success: boolean
  /** List of error messages if validation failed. */
  errors: string[]
  /** The validated project state (if successful). */
  data?: ProjectState
}
