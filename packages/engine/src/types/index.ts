export type Vector3 = [number, number, number]
export type Color = string  // Hex: "#ff00aa"
export type UUID = string

export interface Transform {
  position: Vector3
  rotation: Vector3   // Euler angles in radians
  scale: Vector3
}

export interface BaseActor {
  id: UUID
  name: string
  transform: Transform
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
export type AnimationState = 'idle' | 'walk' | 'run' | 'wave' | 'talk' | 'dance' | 'sit' | 'jump'

export interface MorphTargets {
  mouthSmile?: number      // 0-1
  mouthOpen?: number
  jawOpen?: number
  browInnerUp?: number
  eyeBlinkLeft?: number
  eyeBlinkRight?: number
  eyeSquintLeft?: number
  eyeSquintRight?: number
  noseSneerLeft?: number
  noseSneerRight?: number
}

export interface BodyPose {
  head?: Vector3
  spine?: Vector3
  leftArm?: Vector3
  rightArm?: Vector3
  leftLeg?: Vector3
  rightLeg?: Vector3
}

export interface ClothingItem {
  type: string        // 'hat' | 'jacket' | 'boots' | etc.
  color: Color
  visible: boolean
}

export interface ClothingSlots {
  head?: ClothingItem[]
  torso?: ClothingItem[]
  arms?: ClothingItem[]
  legs?: ClothingItem[]
}

export interface CharacterActor extends BaseActor {
  type: 'character'
  animation: AnimationState
  animationSpeed?: number
  morphTargets: MorphTargets
  bodyPose: BodyPose
  clothing: ClothingSlots
}

// ---- Primitive ----
export type PrimitiveShape = 'box' | 'sphere' | 'cylinder' | 'plane' | 'cone' | 'torus' | 'capsule'

export interface PrimitiveActor extends BaseActor {
  type: 'primitive'
  properties: {
    shape: PrimitiveShape
    color: Color
    roughness: number
    metalness: number
  }
}

// ---- Light ----
export type LightType = 'point' | 'spot' | 'directional'

export interface LightActor extends BaseActor {
  type: 'light'
  properties: {
    lightType: LightType
    intensity: number
    color: Color
    castShadow: boolean
  }
}

// ---- Camera ----
export interface CameraActor extends BaseActor {
  type: 'camera'
  properties: {
    fov: number
    near: number
    far: number
  }
}

// ---- Speaker (Audio) ----
export interface SpeakerActor extends BaseActor {
  type: 'speaker'
  properties: {
    audioUrl?: string
    volume: number
    loop: boolean
    spatial: boolean
  }
}

// ---- Union ----
export type Actor = CharacterActor | PrimitiveActor | LightActor | CameraActor | SpeakerActor

// ---- Timeline ----

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'step'

export interface Keyframe<T = unknown> {
  time: number         // seconds
  value: T
  easing?: EasingType
}

export interface AnimationTrack {
  targetId: UUID
  property: string     // dot-path: 'transform.position', 'morphTargets.mouthSmile'
  keyframes: Keyframe[]
}

export type TransitionType = 'cut' | 'dissolve' | 'fade'

export interface CameraCut {
  id: UUID
  time: number
  cameraId: UUID
  transition: TransitionType
  transitionDuration: number
}

export interface Timeline {
  duration: number
  cameraTrack: CameraCut[]
  animationTracks: AnimationTrack[]
}

// ---- Environment ----

export type WeatherType = 'none' | 'rain' | 'snow' | 'dust'

export interface Weather {
  type: WeatherType
  intensity: number    // 0-1
}

export interface Fog {
  color: Color
  near: number
  far: number
}

export interface Environment {
  ambientLight: { intensity: number; color: Color }
  sun: { position: Vector3; intensity: number; color: Color }
  skyColor: Color
  fog?: Fog
  weather?: Weather
}

// ---- Project ----

export interface ProjectMeta {
  title: string
  description?: string
  version: string
  author?: string
}

export interface ProjectState {
  meta: ProjectMeta
  environment: Environment
  actors: Actor[]
  timeline: Timeline
  library: { clips: unknown[] }
}

export interface ValidationResult {
  success: boolean
  errors: string[]
  data?: ProjectState
}
