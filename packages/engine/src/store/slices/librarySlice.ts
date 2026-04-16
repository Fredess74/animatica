import { StateCreator } from 'zustand';
import { LibrarySlice, SceneStoreState } from '../types';

export const createLibrarySlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  LibrarySlice
> = (set) => ({
  library: {
    clips: [],
  },

  addClip: (clip) =>
    set((state) => {
      state.library.clips.push(clip);
    }),

  setLibrary: (library) =>
    set((state) => {
      state.library = library;
    }),
});
