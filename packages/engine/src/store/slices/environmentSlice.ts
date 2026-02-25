import { StateCreator } from 'zustand';
import { EnvironmentSlice, SceneStoreState } from '../types';

export const createEnvironmentSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  EnvironmentSlice
> = (set) => ({
  environment: {
    ambientLight: { intensity: 0.5, color: '#ffffff' },
    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
    skyColor: '#87CEEB',
  },

  setEnvironment: (environment) =>
    set((state) => {
      Object.assign(state.environment, environment);
    }),
});
