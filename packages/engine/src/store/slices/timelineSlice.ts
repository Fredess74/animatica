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
    markers: [],
  },
  tracksByTargetId: {},

  setTimeline: (timeline) =>
    set((state) => {
      const tracksChanged = !!timeline.animationTracks;
      Object.assign(state.timeline, timeline);

      if (tracksChanged) {
        const index: Record<string, any[]> = {};
        for (const track of state.timeline.animationTracks) {
          if (!index[track.targetId]) {
            index[track.targetId] = [];
          }
          // Pre-sort keyframes for faster interpolation
          const sortedTrack = {
            ...track,
            keyframes: [...track.keyframes].sort((a, b) => a.time - b.time),
          };
          index[track.targetId].push(sortedTrack);
        }
        state.tracksByTargetId = index;
      }
    }),
});
