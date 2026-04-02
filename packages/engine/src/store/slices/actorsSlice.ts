import { StateCreator } from 'zustand';
import { ActorsSlice, SceneStoreState } from '../types';

export const createActorsSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  ActorsSlice
> = (set) => ({
  actors: [],
  actorsById: {},
  selectedActorId: null,

  addActor: (actor) =>
    set((state) => {
      state.actors.push(actor);
      state.actorsById[actor.id] = actor;
    }),

  removeActor: (actorId) =>
    set((state) => {
      state.actors = state.actors.filter((a) => a.id !== actorId);
      delete state.actorsById[actorId];
      if (state.selectedActorId === actorId) {
        state.selectedActorId = null;
      }
    }),

  updateActor: (actorId, updates) =>
    set((state) => {
      const index = state.actors.findIndex((a) => a.id === actorId);
      if (index !== -1) {
        Object.assign(state.actors[index], updates);
        state.actorsById[actorId] = state.actors[index];
      }
    }),

  setSelectedActor: (id) =>
    set((state) => {
      state.selectedActorId = id;
    }),
});
