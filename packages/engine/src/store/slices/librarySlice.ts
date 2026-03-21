import { StateCreator } from 'zustand';
import { LibrarySlice, SceneStoreState } from '../types';

/**
 * Creates the asset library slice for the scene store.
 */
export const createLibrarySlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  LibrarySlice
> = (set) => ({
  library: {
    clips: [],
  },

  setLibrary: (library) =>
    set((state) => {
      state.library = library;
    }),
});
