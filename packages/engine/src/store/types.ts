import { Actor, Environment, Timeline, ProjectMeta } from '../types';

/**
 * Loop modes for playback.
 */
export type LoopMode = 'none' | 'loop' | 'pingpong';

/**
 * Playback state for the scene.
 */
export interface PlaybackState {
  /** Current playback time in seconds. */
  currentTime: number;
  /** Whether the scene is currently playing. */
  isPlaying: boolean;
  /** Frame rate for playback (e.g., 24, 30, 60). */
  frameRate: number;
  /** Playback speed multiplier (default: 1.0). */
  speed: number;
  /** Playback direction (1 for forward, -1 for backward). */
  direction: 1 | -1;
  /** Current loop mode. */
  loopMode: LoopMode;
}

/**
 * Actors-specific state and actions.
 */
export interface ActorsSlice {
  /** List of actors in the scene. */
  actors: Actor[];
  /** The ID of the currently selected actor, or null if none selected. */
  selectedActorId: string | null;
  /** Adds a new actor to the scene. */
  addActor: (actor: Actor) => void;
  /** Removes an actor from the scene by ID. */
  removeActor: (actorId: string) => void;
  /** Updates properties of an existing actor. */
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  /** Sets the currently selected actor. */
  setSelectedActor: (id: string | null) => void;
}

/**
 * Environment-specific state and actions.
 */
export interface EnvironmentSlice {
  /** Environment settings. */
  environment: Environment;
  /** Updates the scene environment settings. */
  setEnvironment: (environment: Partial<Environment>) => void;
}

/**
 * Timeline-specific state and actions.
 */
export interface TimelineSlice {
  /** Timeline configuration. */
  timeline: Timeline;
  /** Updates the timeline configuration. */
  setTimeline: (timeline: Partial<Timeline>) => void;
}

/**
 * Playback-specific state and actions.
 */
export interface PlaybackSlice {
  /** Playback status and time. */
  playback: PlaybackState;
  /** Updates playback state (play/pause, time, etc.). */
  setPlayback: (playback: Partial<PlaybackState>) => void;
}

/**
 * Metadata-specific state and actions.
 */
export interface MetaSlice {
  /** Project metadata. */
  meta: ProjectMeta;
  /** Updates project metadata. */
  setMeta: (meta: Partial<ProjectMeta>) => void;
}

/**
 * Asset library state and actions.
 */
export interface LibrarySlice {
  /** Asset library. */
  library: { clips: unknown[] };
  /** Sets the asset library. */
  setLibrary: (library: { clips: unknown[] }) => void;
}

/**
 * Combined state and actions for the scene store.
 */
export interface SceneStoreState extends
  ActorsSlice,
  EnvironmentSlice,
  TimelineSlice,
  PlaybackSlice,
  MetaSlice,
  LibrarySlice {}
