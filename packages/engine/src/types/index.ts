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
  readonly position: Vector3
  /** The rotation of the object as Euler angles in radians [x, y, z]. */
  readonly rotation: Vector3
  /** The scale of the object as [x, y, z]. */
  readonly scale: Vector3
}

/**
 * Base interface for all actors in the scene.
 */
export interface BaseActor {
  /** Unique identifier for the actor. */
  readonly id: UUID
  /** Human-readable name of the actor. */
  readonly name: string
  /** The actor's transformation in 3D space. */
  readonly transform: Transform
  /** Whether the actor is visible in the scene. */
  readonly visible: boolean
  /**
   * UX Enhancement: Prevents accidental selection/edits in editor.
   * Useful for background elements or completed parts of the scene.
   */
  readonly locked?: boolean
  /**
   * UX Enhancement: Description for accessibility and organization.
   * Can be used as alt text or tooltip content in the editor.
   */
  readonly description?: string
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
  readonly mouthSmile?: number
  /** Mouth open intensity (0-1). */
  readonly mouthOpen?: number
  /** Jaw open intensity (0-1). */
  readonly jawOpen?: number
  /** Inner brow raise intensity (0-1). */
  readonly browInnerUp?: number
  /** Left eye blink intensity (0-1). */
  readonly eyeBlinkLeft?: number
  /** Right eye blink intensity (0-1). */
  readonly eyeBlinkRight?: number
  /** Left eye squint intensity (0-1). */
  readonly eyeSquintLeft?: number
  /** Right eye squint intensity (0-1). */
  readonly eyeSquintRight?: number
  /** Left nose sneer intensity (0-1). */
  readonly noseSneerLeft?: number
  /** Right nose sneer intensity (0-1). */
  readonly noseSneerRight?: number
}

/**
 * Body pose configuration defining rotation for specific body parts.
 */
export interface BodyPose {
  /** Rotation for the head. */
  readonly head?: Vector3
  /** Rotation for the spine. */
  readonly spine?: Vector3
  /** Rotation for the left arm. */
  readonly leftArm?: Vector3
  /** Rotation for the right arm. */
  readonly rightArm?: Vector3
  /** Rotation for the left leg. */
  readonly leftLeg?: Vector3
  /** Rotation for the right leg. */
  readonly rightLeg?: Vector3
}

/**
 * Represents a single clothing item.
 */
export interface ClothingItem {
  /** The type/model of the clothing item (e.g., 'hat', 'jacket'). */
  readonly type: string
  /** The color of the clothing item. */
  readonly color: Color
  /** Whether the clothing item is visible. */
  readonly visible: boolean
}

/**
 * Slots for equipping clothing items on a character.
 */
export interface ClothingSlots {
  /** Items equipped on the head. */
  readonly head?: ClothingItem[]
  /** Items equipped on the torso. */
  readonly torso?: ClothingItem[]
  /** Items equipped on the arms. */
  readonly arms?: ClothingItem[]
  /** Items equipped on the legs. */
  readonly legs?: ClothingItem[]
}

/**
 * Represents a character actor in the scene.
 */
export interface CharacterActor extends BaseActor {
  /** Discriminator for the actor type. */
  readonly type: 'character'
  /** Current animation state. */
  readonly animation: AnimationState
  /** Speed multiplier for the animation (default: 1). */
  readonly animationSpeed?: number
  /** Facial expression morph targets. */
  readonly morphTargets: MorphTargets
  /** Custom body pose overrides. */
  readonly bodyPose: BodyPose
  /** Equipped clothing items. */
  readonly clothing: ClothingSlots
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
  readonly type: 'primitive'
  /** Properties specific to the primitive shape and material. */
  readonly properties: {
    /** The geometric shape of the primitive. */
    readonly shape: PrimitiveShape
    /** The color of the material. */
    readonly color: Color
    /** Material roughness (0-1). */
    readonly roughness: number
    /** Material metalness (0-1). */
    readonly metalness: number
    /** Material opacity (0-1). */
    readonly opacity: number
    /** Whether to render in wireframe mode. */
    readonly wireframe: boolean
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
  readonly type: 'light'
  /** Properties specific to the light source. */
  readonly properties: {
    /** The type of light source. */
    readonly lightType: LightType
    /** Light intensity. */
    readonly intensity: number
    /** Light color. */
    readonly color: Color
    /** Whether the light casts shadows. */
    readonly castShadow: boolean
  }
}

// ---- Camera ----

/**
 * Represents a camera actor.
 */
export interface CameraActor extends BaseActor {
  /** Discriminator for the actor type. */
  readonly type: 'camera'
  /** Properties specific to the camera. */
  readonly properties: {
    /** Field of view in degrees. */
    readonly fov: number
    /** Near clipping plane distance. */
    readonly near: number
    /** Far clipping plane distance. */
    readonly far: number
  }
}

// ---- Speaker (Audio) ----

/**
 * Represents an audio source actor.
 */
export interface SpeakerActor extends BaseActor {
  /** Discriminator for the actor type. */
  readonly type: 'speaker'
  /** Properties specific to the audio source. */
  readonly properties: {
    /** URL of the audio file. */
    readonly audioUrl?: string
    /** Audio volume (0-1). */
    readonly volume: number
    /** Whether the audio should loop. */
    readonly loop: boolean
    /** Whether the audio is spatial (3D). */
    readonly spatial: boolean
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
  readonly time: number
  /** Value at this keyframe. */
  readonly value: T
  /** Easing function to use when interpolating to the next keyframe. */
  readonly easing?: EasingType
}

/**
 * An animation track targeting a specific property of an actor.
 */
export interface AnimationTrack {
  /** ID of the target actor. */
  readonly targetId: UUID
  /** Dot-notation path to the property being animated (e.g., 'transform.position'). */
  readonly property: string
  /** Array of keyframes for this property. */
  readonly keyframes: Keyframe[]
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
  readonly id: UUID
  /** Time when the cut occurs (in seconds). */
  readonly time: number
  /** ID of the camera to switch to. */
  readonly cameraId: UUID
  /** Type of transition to this camera. */
  readonly transition: TransitionType
  /** Duration of the transition in seconds. */
  readonly transitionDuration: number
}

/**
 * The complete timeline configuration for the scene.
 */
export interface Timeline {
  /** Total duration of the scene in seconds. */
  readonly duration: number
  /** Sequence of camera cuts. */
  readonly cameraTrack: CameraCut[]
  /** Collection of animation tracks for actors. */
  readonly animationTracks: AnimationTrack[]
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
  readonly type: WeatherType
  /** Intensity of the weather effect (0-1). */
  readonly intensity: number
}

/**
 * Fog configuration.
 */
export interface Fog {
  /** Fog color. */
  readonly color: Color
  /** Distance where fog starts. */
  readonly near: number
  /** Distance where fog is fully opaque. */
  readonly far: number
}

/**
 * Scene environment configuration.
 */
export interface Environment {
  /** Ambient light settings. */
  readonly ambientLight: { readonly intensity: number; readonly color: Color }
  /** Sun (directional light) settings. */
  readonly sun: { readonly position: Vector3; readonly intensity: number; readonly color: Color }
  /** Background sky color. */
  readonly skyColor: Color
  /** Optional fog settings. */
  readonly fog?: Fog
  /** Optional weather settings. */
  readonly weather?: Weather
}

// ---- Project ----

/**
 * Metadata for the project.
 */
export interface ProjectMeta {
  /** Title of the project. */
  readonly title: string
  /** Description of the project. */
  readonly description?: string
  /** Project version string (semver). */
  readonly version: string
  /** Author name. */
  readonly author?: string
}

/**
 * The complete state of a project, including all actors, timeline, and environment settings.
 */
export interface ProjectState {
  /** Project metadata. */
  readonly meta: ProjectMeta
  /** Environment settings. */
  readonly environment: Environment
  /** List of actors in the scene. */
  readonly actors: Actor[]
  /** Animation and camera timeline. */
  readonly timeline: Timeline
  /** Asset library (unused currently). */
  readonly library: { readonly clips: unknown[] }
}

/**
 * Result of a project validation operation.
 */
export interface ValidationResult {
  /** Whether the validation was successful. */
  readonly success: boolean
  /** List of error messages if validation failed. */
  readonly errors: string[]
  /** The validated project state (if successful). */
  readonly data?: ProjectState
}
