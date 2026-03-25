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
      Object.assign(state.timeline, timeline);
      if (timeline.animationTracks) {
        state.tracksByTargetId = {};
        for (const track of state.timeline.animationTracks) {
          if (!state.tracksByTargetId[track.targetId]) {
            state.tracksByTargetId[track.targetId] = [];
          }
          state.tracksByTargetId[track.targetId].push(track);
        }
      }
    }),
});
