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
    speed: 1,
    loopMode: 'none',
    direction: 1,
  },

  setPlayback: (playback) =>
    set((state) => {
      Object.assign(state.playback, playback);
    }),
});
