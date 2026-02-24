import { StateCreator } from 'zustand';
import { Actor, Environment, Timeline, ProjectState, ProjectMeta } from '../types';

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
}

export interface ActorsSlice {
  actors: Actor[];
  selectedActorId: string | null;
  addActor: (actor: Actor) => void;
  removeActor: (actorId: string) => void;
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  setSelectedActor: (id: string | null) => void;
}

export interface EnvironmentSlice {
  environment: Environment;
  setEnvironment: (environment: Partial<Environment>) => void;
}

export interface TimelineSlice {
  timeline: Timeline;
  setTimeline: (timeline: Partial<Timeline>) => void;
}

export interface PlaybackSlice {
  playback: PlaybackState;
  setPlayback: (playback: Partial<PlaybackState>) => void;
}

export interface EngineStoreState extends ProjectState, ActorsSlice, EnvironmentSlice, TimelineSlice, PlaybackSlice {
  meta: ProjectMeta;
}

export type StoreSlice<T> = StateCreator<
  EngineStoreState,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  T
>;
