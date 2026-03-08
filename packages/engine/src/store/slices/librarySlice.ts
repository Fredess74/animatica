import { StateCreator } from 'zustand';
import { LibrarySlice, SceneStoreState } from '../types';

export const createLibrarySlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  LibrarySlice
> = () => ({
  library: {
    clips: [],
  },
});
