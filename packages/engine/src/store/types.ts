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
 * Actors-specific state.
 */
export interface ActorsState {
  /** List of actors in the scene. */
  actors: Actor[];
  /** The ID of the currently selected actor, or null if none selected. */
  selectedActorId: string | null;
}

/**
 * Actors-specific actions.
 */
export interface ActorsActions {
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
 * Actors-specific slice combining state and actions.
 */
export interface ActorsSlice extends ActorsState, ActorsActions {}

/**
 * Environment-specific state.
 */
export interface EnvironmentState {
  /** Environment settings. */
  environment: Environment;
}

/**
 * Environment-specific actions.
 */
export interface EnvironmentActions {
  /** Updates the scene environment settings. */
  setEnvironment: (environment: Partial<Environment>) => void;
}

/**
 * Environment-specific slice combining state and actions.
 */
export interface EnvironmentSlice extends EnvironmentState, EnvironmentActions {}

/**
 * Timeline-specific state.
 */
export interface TimelineState {
  /** Timeline configuration. */
  timeline: Timeline;
}

/**
 * Timeline-specific actions.
 */
export interface TimelineActions {
  /** Updates the timeline configuration. */
  setTimeline: (timeline: Partial<Timeline>) => void;
}

/**
 * Timeline-specific slice combining state and actions.
 */
export interface TimelineSlice extends TimelineState, TimelineActions {}

/**
 * Playback-specific state.
 */
export interface PlaybackStateWrapper {
  /** Playback status and time. */
  playback: PlaybackState;
}

/**
 * Playback-specific actions.
 */
export interface PlaybackActions {
  /** Updates playback state (play/pause, time, etc.). */
  setPlayback: (playback: Partial<PlaybackState>) => void;
}

/**
 * Playback-specific slice combining state and actions.
 */
export interface PlaybackSlice extends PlaybackStateWrapper, PlaybackActions {}

/**
 * Metadata-specific state.
 */
export interface MetaState {
  /** Project metadata. */
  meta: ProjectMeta;
}

/**
 * Metadata-specific actions.
 */
export interface MetaActions {
  /** Updates project metadata. */
  setMeta: (meta: Partial<ProjectMeta>) => void;
}

/**
 * Metadata-specific slice combining state and actions.
 */
export interface MetaSlice extends MetaState, MetaActions {}

/**
 * Library-specific state.
 */
export interface LibraryState {
  /** Asset library. */
  library: { clips: unknown[] };
}

/**
 * Combined state and actions for the scene store.
 */
export interface SceneStoreState extends
  ActorsState,
  ActorsActions,
  EnvironmentState,
  EnvironmentActions,
  TimelineState,
  TimelineActions,
  PlaybackStateWrapper,
  PlaybackActions,
  MetaState,
  MetaActions,
  LibraryState {}
