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
    direction: 1,
    loopMode: 'none',
  },

  setPlayback: (playback) =>
    set((state) => {
      Object.assign(state.playback, playback);
    }),
});
