import { StateCreator } from 'zustand';
import { MetaSlice, SceneStoreState } from '../types';

export const createMetaSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  MetaSlice
> = (set) => ({
  meta: {
    title: 'Untitled Project',
    version: '1.0.0',
  },

  setMeta: (meta) =>
    set((state) => {
      Object.assign(state.meta, meta);
    }),
});
