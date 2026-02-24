import { Environment } from '../../types';
import { EnvironmentSlice, StoreSlice } from '../types';

const initialEnvironment: Environment = {
  ambientLight: { intensity: 0.5, color: '#ffffff' },
  sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
  skyColor: '#87CEEB',
};

export const createEnvironmentSlice: StoreSlice<EnvironmentSlice> = (set) => ({
  environment: initialEnvironment,
  setEnvironment: (environment: Partial<Environment>) =>
    set((state) => {
      Object.assign(state.environment, environment);
    }),
});
