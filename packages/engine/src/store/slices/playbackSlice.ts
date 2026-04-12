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

  setPlayback: (updates) =>
    set((state) => {
      const hasChanges = Object.entries(updates).some(
        ([key, value]) => state.playback[key as keyof typeof updates] !== value
      );
      if (hasChanges) {
        Object.assign(state.playback, updates);
      }
    }),

  setCurrentTime: (time) =>
    set((state) => {
      if (state.playback.currentTime !== time) {
        state.playback.currentTime = time;
      }
    }),
});
