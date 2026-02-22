import { StateCreator } from 'zustand';
import { EngineStoreState, TimelineSlice } from '../types';

/**
 * Creates the timeline slice for managing animation tracks and keyframes.
 * @param set - Zustand set function
 * @returns TimelineSlice
 */
export const createTimelineSlice: StateCreator<
  EngineStoreState,
  [['zustand/immer', never]],
  [],
  TimelineSlice
> = (set) => ({
  timeline: {
    duration: 10,
    cameraTrack: [],
    animationTracks: [],
  },

  /**
   * Updates the timeline properties (duration, tracks, etc).
   * @param timeline - Partial timeline object
   */
  setTimeline: (timeline) =>
    set((state) => {
      Object.assign(state.timeline, timeline);
    }),

  /**
   * Adds a keyframe to a specific track. Creates the track if it doesn't exist.
   * @param targetId - The ID of the actor or object being animated
   * @param property - The property path being animated (e.g., "transform.position.x")
   * @param keyframe - The keyframe object to add
   */
  addKeyframe: (targetId, property, keyframe) =>
    set((state) => {
      const track = state.timeline.animationTracks.find(
        (t) => t.targetId === targetId && t.property === property
      );
      if (track) {
        track.keyframes.push(keyframe);
      } else {
        state.timeline.animationTracks.push({
          targetId,
          property,
          keyframes: [keyframe],
        });
      }
    }),
});
