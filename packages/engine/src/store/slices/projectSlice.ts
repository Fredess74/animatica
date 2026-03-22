import { StateCreator } from 'zustand';
import { ProjectSlice, SceneStoreState } from '../types';

export const createProjectSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  ProjectSlice
> = (set) => ({
  setProject: (project) =>
    set((state) => {
      state.meta = project.meta;
      state.environment = project.environment;
      state.actors = project.actors;
      state.timeline = project.timeline;
      state.library = project.library;

      // Reset non-project state
      state.selectedActorId = null;
      state.playback = {
        currentTime: 0,
        isPlaying: false,
        frameRate: 24,
        speed: 1.0,
        direction: 1,
        loopMode: 'none',
      };
    }),
});
