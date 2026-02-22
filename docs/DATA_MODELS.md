# Data Models

## TypeScript Interfaces

All interfaces live in `packages/engine/src/types/index.ts`.

---

## Core Primitives

```typescript
export type Vector3 = [number, number, number]
export type Color = string  // Hex: "#ff00aa"
export type UUID = string

export interface Transform {
  position: Vector3
  rotation: Vector3   // Euler angles in radians
  scale: Vector3
}
```

---

## Actors (Discriminated Union)

```typescript
export interface BaseActor {
  id: UUID
  name: string
  transform: Transform
  visible: boolean
  // UX Enhancements
  locked?: boolean
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
```

---

## Timeline

```typescript
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
```

---

## Environment

```typescript
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
```

---

## Project

```typescript
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
```

---

## Database Schema (PostgreSQL / Supabase)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Films
CREATE TABLE films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  project_json JSONB,          -- Full ProjectState
  duration_seconds INTEGER,
  rating TEXT DEFAULT 'G',     -- G, PG, T, M
  visibility TEXT DEFAULT 'public',  -- public, unlisted, private
  series_id UUID REFERENCES series(id),
  episode_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Film Creators (many-to-many with roles)
CREATE TABLE film_creators (
  film_id UUID REFERENCES films(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,           -- director, writer, animator, etc.
  revenue_share_bps INTEGER,   -- basis points (5000 = 50%)
  PRIMARY KEY (film_id, user_id)
);

-- Series
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets (marketplace)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  preview_url TEXT,
  price_cents INTEGER DEFAULT 0,
  royalty_bps INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id),
  film_id UUID REFERENCES films(id),
  amount_wei TEXT NOT NULL,
  currency TEXT DEFAULT 'ETH',
  tx_hash TEXT UNIQUE NOT NULL,
  chain TEXT DEFAULT 'base',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Views & Analytics
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID REFERENCES films(id),
  user_id UUID REFERENCES users(id),
  watched_seconds INTEGER,
  total_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID REFERENCES films(id),
  user_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES comments(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  film_id UUID REFERENCES films(id),
  user_id UUID REFERENCES users(id),
  PRIMARY KEY (film_id, user_id)
);
```
