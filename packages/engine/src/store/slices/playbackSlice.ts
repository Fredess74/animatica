import { StateCreator } from 'zustand';
import { PlaybackSlice, SceneStoreState } from '../types';

export const createPlaybackSlice: StateCreator<
  SceneStoreState,
  [['zustand/immer', never]],
  [],
  PlaybackSlice
> = (set) => ({
  playback: {
    currentTime: 0,
    isPlaying: false,
    frameRate: 24,
    speed: 1.0,
    direction: 1 as const,
    loopMode: 'none' as const,
  },

  setPlayback: (playback) =>
    set((state) => {
      const hasChanges = Object.entries(playback).some(
        ([key, value]) => (state.playback as any)[key] !== value
      );
      if (hasChanges) {
        Object.assign(state.playback, playback);
      }
    }),

  setCurrentTime: (time) =>
    set((state) => {
      if (state.playback.currentTime !== time) {
        state.playback.currentTime = time;
      }
    }),
});
