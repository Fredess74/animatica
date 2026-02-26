import { StateCreator } from 'zustand';
import { TimelineSlice, SceneStoreState } from '../types';

export const createTimelineSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  TimelineSlice
> = (set) => ({
  timeline: {
    duration: 10,
    cameraTrack: [],
    animationTracks: [],
  },

  setTimeline: (timeline) =>
    set((state) => {
      Object.assign(state.timeline, timeline);
    }),
});
