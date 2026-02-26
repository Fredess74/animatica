import { StateCreator } from 'zustand';
import { ActorsSlice, SceneStoreState } from '../types';

export const createActorsSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  ActorsSlice
> = (set) => ({
  actors: [],
  selectedActorId: null,

  addActor: (actor) =>
    set((state) => {
      state.actors.push(actor);
    }),

  removeActor: (actorId) =>
    set((state) => {
      state.actors = state.actors.filter((a) => a.id !== actorId);
      if (state.selectedActorId === actorId) {
        state.selectedActorId = null;
      }
    }),

  updateActor: (actorId, updates) =>
    set((state) => {
      const actor = state.actors.find((a) => a.id === actorId);
      if (actor) {
        Object.assign(actor, updates);
      }
    }),

  setSelectedActor: (id) =>
    set((state) => {
      state.selectedActorId = id;
    }),
});
