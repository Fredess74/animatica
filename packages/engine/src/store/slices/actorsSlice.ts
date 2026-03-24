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
      // Use the proxied object from the array to ensure they remain in sync
      state.actorsById[actor.id] = state.actors[state.actors.length - 1];
    }),

  removeActor: (actorId) =>
    set((state) => {
      const index = state.actors.findIndex((a) => a.id === actorId);
      if (index !== -1) {
        state.actors.splice(index, 1);
      }
      delete state.actorsById[actorId];
      if (state.selectedActorId === actorId) {
        state.selectedActorId = null;
      }
    }),

  updateActor: (actorId, updates) =>
    set((state) => {
      const actor = state.actors.find((a) => a.id === actorId);
      if (actor) {
        Object.assign(actor, updates);
        state.actorsById[actorId] = actor;
      }
    }),

  setSelectedActor: (id) =>
    set((state) => {
      state.selectedActorId = id;
    }),
});
