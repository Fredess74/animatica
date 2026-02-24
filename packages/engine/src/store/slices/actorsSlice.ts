import { Actor } from '../../types';
import { ActorsSlice, StoreSlice } from '../types';

export const createActorsSlice: StoreSlice<ActorsSlice> = (set) => ({
  actors: [],
  selectedActorId: null,

  addActor: (actor: Actor) =>
    set((state) => {
      state.actors.push(actor);
    }),

  removeActor: (actorId: string) =>
    set((state) => {
      state.actors = state.actors.filter((a) => a.id !== actorId);
      if (state.selectedActorId === actorId) {
        state.selectedActorId = null;
      }
    }),

  updateActor: (actorId: string, updates: Partial<Actor>) =>
    set((state) => {
      const actor = state.actors.find((a) => a.id === actorId);
      if (actor) {
        Object.assign(actor, updates);
      }
    }),

  setSelectedActor: (id: string | null) =>
    set((state) => {
      state.selectedActorId = id;
    }),
});
