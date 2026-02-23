import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Actor, Environment, Timeline, ProjectState, ProjectMeta, LoopMode } from '../types';

/**
 * Playback state for the scene.
 */
interface PlaybackState {
  /** Current playback time in seconds. */
  currentTime: number;
  /** Whether the scene is currently playing. */
  isPlaying: boolean;
  /** Frame rate for playback (e.g., 24, 30, 60). */
  frameRate: number;
  /** Playback loop mode. */
  loopMode: LoopMode;
}

/**
 * State and actions for the scene store.
 */
interface SceneStoreState extends ProjectState {
  // Runtime state
  playback: PlaybackState;

  // Actions
  /** Adds a new actor to the scene. */
  addActor: (actor: Actor) => void;
  /** Removes an actor from the scene by ID. */
  removeActor: (actorId: string) => void;
  /** Updates properties of an existing actor. */
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  /** Updates the scene environment settings. */
  setEnvironment: (environment: Partial<Environment>) => void;
  /** Updates the timeline configuration. */
  setTimeline: (timeline: Partial<Timeline>) => void;
  /** Updates playback state (play/pause, time, etc.). */
  setPlayback: (playback: Partial<PlaybackState>) => void;
}

const initialMeta: ProjectMeta = {
  title: 'Untitled Project',
  version: '1.0.0',
};

const initialEnvironment: Environment = {
  ambientLight: { intensity: 0.5, color: '#ffffff' },
  sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
  skyColor: '#87CEEB',
};

const initialTimeline: Timeline = {
  duration: 10,
  cameraTrack: [],
  animationTracks: [],
  markers: [],
};

const initialState: ProjectState & { playback: PlaybackState } = {
  meta: initialMeta,
  environment: initialEnvironment,
  actors: [],
  timeline: initialTimeline,
  library: { clips: [] },
  playback: { currentTime: 0, isPlaying: false, frameRate: 24, loopMode: 'none' },
};

/**
 * Zustand store for managing the scene state, including actors, timeline, environment, and playback.
 * Uses `immer` middleware for immutable state updates.
 *
 * @example
 * ```tsx
 * const { actors, addActor } = useSceneStore()
 * ```
 */
export const useSceneStore = create<SceneStoreState>()(
  immer((set) => ({
    ...initialState,

    addActor: (actor) =>
      set((state) => {
        state.actors.push(actor);
      }),

    removeActor: (actorId) =>
      set((state) => {
        state.actors = state.actors.filter((a) => a.id !== actorId);
      }),

    updateActor: (actorId, updates) =>
      set((state) => {
        const actor = state.actors.find((a) => a.id === actorId);
        if (actor) {
          Object.assign(actor, updates);
        }
      }),

    setEnvironment: (environment) =>
      set((state) => {
        Object.assign(state.environment, environment);
      }),

    setTimeline: (timeline) =>
      set((state) => {
        Object.assign(state.timeline, timeline);
      }),

    setPlayback: (playback) =>
      set((state) => {
        Object.assign(state.playback, playback);
      }),
  }))
);

// Selectors

/**
 * Selector to get an actor by its ID.
 * @param id The UUID of the actor.
 * @returns The actor object if found, otherwise undefined.
 */
export const getActorById = (id: string) => (state: SceneStoreState): Actor | undefined =>
  state.actors.find((a) => a.id === id);

/**
 * Selector to get all currently visible actors.
 * @returns An array of visible actors.
 */
export const getActiveActors = (state: SceneStoreState): Actor[] =>
  state.actors.filter((a) => a.visible);

/**
 * Selector to get the current playback time.
 * @returns The current time in seconds.
 */
export const getCurrentTime = (state: SceneStoreState): number =>
  state.playback.currentTime;
