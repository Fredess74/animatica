import { StateCreator } from 'zustand';
import { EngineStoreState, PlaybackSlice } from '../types';

/**
 * Creates the playback slice for controlling timeline playback.
 * @param set - Zustand set function
 * @returns PlaybackSlice
 */
export const createPlaybackSlice: StateCreator<
  EngineStoreState,
  [['zustand/immer', never]],
  [],
  PlaybackSlice
> = (set) => ({
  playback: {
    currentTime: 0,
    isPlaying: false,
    frameRate: 30,
  },
  setPlayback: (playback) =>
    set((state) => {
      Object.assign(state.playback, playback);
    }),
  play: () =>
    set((state) => {
      state.playback.isPlaying = true;
    }),
  pause: () =>
    set((state) => {
      state.playback.isPlaying = false;
    }),
  seek: (time) =>
    set((state) => {
      state.playback.currentTime = time;
    }),
});
