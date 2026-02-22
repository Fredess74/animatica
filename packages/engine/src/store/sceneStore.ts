/**
 * Global Zustand store for managing the scene state.
 * Handles actors, timeline, environment, and playback state.
 * Uses Immer for immutable updates.
 *
 * @module @animatica/engine/store
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Actor, Environment, Timeline, ProjectState, ProjectMeta } from '../types';

interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  frameRate: number;
}

interface SceneStoreState extends ProjectState {
  // Runtime state
  playback: PlaybackState;

  // Actions
  addActor: (actor: Actor) => void;
  removeActor: (actorId: string) => void;
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  setEnvironment: (environment: Partial<Environment>) => void;
  setTimeline: (timeline: Partial<Timeline>) => void;
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
};

const initialState: ProjectState & { playback: PlaybackState } = {
  meta: initialMeta,
  environment: initialEnvironment,
  actors: [],
  timeline: initialTimeline,
  library: { clips: [] },
  playback: { currentTime: 0, isPlaying: false, frameRate: 24 },
};

/**
 * Hook to access and modify the scene store.
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
export const getActorById = (id: string) => (state: SceneStoreState): Actor | undefined =>
  state.actors.find((a) => a.id === id);

export const getActiveActors = (state: SceneStoreState): Actor[] =>
  state.actors.filter((a) => a.visible);

export const getCurrentTime = (state: SceneStoreState): number =>
  state.playback.currentTime;
