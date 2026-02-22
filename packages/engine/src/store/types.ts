import { Actor, Environment, Timeline, ProjectMeta, ProjectState, Keyframe } from '../types';

/**
 * Playback state for the animation engine.
 */
export interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  frameRate: number;
}

/**
 * Slice for managing actors in the scene.
 */
export interface ActorsSlice {
  actors: Actor[];

  /**
   * Adds a new actor to the scene.
   * @param actor - The actor object to add
   */
  addActor: (actor: Actor) => void;

  /**
   * Removes an actor by ID.
   * @param actorId - The ID of the actor to remove
   */
  removeActor: (actorId: string) => void;

  /**
   * Updates properties of an existing actor.
   * @param actorId - The ID of the actor to update
   * @param updates - Partial actor object with updates
   */
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
}

/**
 * Slice for managing timeline and keyframes.
 */
export interface TimelineSlice {
  timeline: Timeline;

  /**
   * Updates timeline properties like duration.
   * @param timeline - Partial timeline object
   */
  setTimeline: (timeline: Partial<Timeline>) => void;

  /**
   * Adds a keyframe to an animation track.
   * @param trackId - The target ID being animated
   * @param property - The property path
   * @param keyframe - The keyframe object
   */
  addKeyframe: (trackId: string, property: string, keyframe: Keyframe) => void;
}

/**
 * Slice for managing environment settings (lighting, sky, weather).
 */
export interface EnvironmentSlice {
  environment: Environment;

  /**
   * Updates environment settings.
   * @param environment - Partial environment object
   */
  setEnvironment: (environment: Partial<Environment>) => void;
}

/**
 * Slice for managing playback control.
 */
export interface PlaybackSlice {
  playback: PlaybackState;

  /**
   * Updates playback state directly.
   * @param playback - Partial playback state
   */
  setPlayback: (playback: Partial<PlaybackState>) => void;

  /**
   * Starts playback.
   */
  play: () => void;

  /**
   * Pauses playback.
   */
  pause: () => void;

  /**
   * Seeks to a specific time.
   * @param time - Time in seconds
   */
  seek: (time: number) => void;
}

/**
 * Slice for project-level operations.
 */
export interface ProjectSlice {
  meta: ProjectMeta;
  library: { clips: unknown[] };

  /**
   * Loads a complete project state, replacing current state.
   * @param project - The full project state object
   */
  loadProject: (project: ProjectState) => void;
}

/**
 * Combined store state for the Engine.
 */
export type EngineStoreState = ActorsSlice & TimelineSlice & EnvironmentSlice & PlaybackSlice & ProjectSlice;
