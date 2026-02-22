import { StateCreator } from 'zustand';
import { EngineStoreState, ActorsSlice } from '../types';

/**
 * Creates the actors slice for managing scene actors.
 * @param set - Zustand set function
 * @returns ActorsSlice
 */
export const createActorsSlice: StateCreator<
  EngineStoreState,
  [['zustand/immer', never]],
  [],
  ActorsSlice
> = (set) => ({
  actors: [],
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
});
