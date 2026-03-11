import { StateCreator } from 'zustand';
import { LibrarySlice, SceneStoreState } from '../types';

/**
 * Slice for managing the asset library.
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
