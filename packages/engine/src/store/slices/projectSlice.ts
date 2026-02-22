import { StateCreator } from 'zustand';
import { EngineStoreState, ProjectSlice } from '../types';

/**
 * Creates the project slice for loading and managing project metadata.
 * @param set - Zustand set function
 * @returns ProjectSlice
 */
export const createProjectSlice: StateCreator<
  EngineStoreState,
  [['zustand/immer', never]],
  [],
  ProjectSlice
> = (set) => ({
  meta: {
    title: 'Untitled Project',
    version: '1.0.0',
  },
  library: { clips: [] },

  /**
   * Loads a complete project state.
   */
  loadProject: (project) =>
    set((state) => {
      state.meta = project.meta;
      state.environment = project.environment;
      state.actors = project.actors;
      state.timeline = project.timeline;
      state.library = project.library;

      // Reset playback
      state.playback.currentTime = 0;
      state.playback.isPlaying = false;
    }),
});
