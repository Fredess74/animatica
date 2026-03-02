import { StateCreator } from 'zustand';
import { LibrarySlice, SceneStoreState } from '../types';

/**
 * Creates the library slice for managing the asset library in the scene store.
 * Following the project's state creator pattern.
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
