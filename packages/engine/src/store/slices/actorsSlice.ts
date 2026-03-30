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
      // Mutate map directly - Immer will handle the proxy/reactivity efficiently.
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
      // Find the index in the actors array.
      const index = state.actors.findIndex((a) => a.id === actorId);
      if (index !== -1) {
        // Apply updates to the actor in the array.
        Object.assign(state.actors[index], updates);
        // Sync the lookup map with the updated actor proxy from the array.
        state.actorsById[actorId] = state.actors[index];
      }
    }),

  setSelectedActor: (id) =>
    set((state) => {
      state.selectedActorId = id;
    }),
});
