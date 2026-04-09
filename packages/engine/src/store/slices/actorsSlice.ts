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
      const actorIndex = state.actors.findIndex((a) => a.id === actorId);
      if (actorIndex === -1) return;

      const actor = state.actors[actorIndex];
      let hasChanges = false;

      // Type-safe shallow comparison to prevent unnecessary state updates
      for (const key in updates) {
        if (
          Object.prototype.hasOwnProperty.call(updates, key) &&
          actor[key as keyof typeof actor] !== updates[key as keyof typeof updates]
        ) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) {
        Object.assign(actor, updates);
      }
    }),

  setSelectedActor: (id) =>
    set((state) => {
      state.selectedActorId = id;
    }),
});
