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

  removeClip: (index) =>
    set((state) => {
      state.library.clips.splice(index, 1);
    }),
});
