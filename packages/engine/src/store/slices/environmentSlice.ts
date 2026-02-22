import { StateCreator } from 'zustand';
import { EngineStoreState, EnvironmentSlice } from '../types';

/**
 * Creates the environment slice for managing lighting and sky.
 * @param set - Zustand set function
 * @returns EnvironmentSlice
 */
export const createEnvironmentSlice: StateCreator<
  EngineStoreState,
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
