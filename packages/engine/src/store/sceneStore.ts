import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Actor, Environment, Timeline, ProjectState } from '../types';

interface SceneStoreState extends ProjectState {
  // Actions
  addActor: (actor: Actor) => void;
  removeActor: (actorId: string) => void;
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  setEnvironment: (environment: Partial<Environment>) => void;
  setTimeline: (timeline: Partial<Timeline>) => void;
}

const initialState: ProjectState = {
  actors: [],
  environment: { id: 'default-env', name: 'Default Environment' },
  timeline: { currentTime: 0, duration: 10, isPlaying: false, frameRate: 24 },
};

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
  }))
);

// Selectors
export const getActorById = (id: string) => (state: SceneStoreState) =>
  state.actors.find((a) => a.id === id);

export const getActiveActors = (state: SceneStoreState) =>
  state.actors.filter((a) => a.isActive);

export const getCurrentTime = (state: SceneStoreState) =>
  state.timeline.currentTime;
