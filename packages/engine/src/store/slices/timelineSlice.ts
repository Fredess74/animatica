import { Timeline } from '../../types';
import { StoreSlice, TimelineSlice } from '../types';

const initialTimeline: Timeline = {
  duration: 10,
  cameraTrack: [],
  animationTracks: [],
};

export const createTimelineSlice: StoreSlice<TimelineSlice> = (set) => ({
  timeline: initialTimeline,
  setTimeline: (timeline: Partial<Timeline>) =>
    set((state) => {
      Object.assign(state.timeline, timeline);
    }),
});
