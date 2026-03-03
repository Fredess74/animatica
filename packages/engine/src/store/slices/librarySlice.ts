import { StateCreator } from 'zustand';
import { LibrarySlice, SceneStoreState } from '../types';

/**
 * Slice for managing asset library state.
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
      Object.assign(state.library, library);
    }),
});
