import { PlaybackSlice, PlaybackState, StoreSlice } from '../types';

const initialPlayback: PlaybackState = {
  currentTime: 0,
  isPlaying: false,
  frameRate: 24,
};

export const createPlaybackSlice: StoreSlice<PlaybackSlice> = (set) => ({
  playback: initialPlayback,
  setPlayback: (playback: Partial<PlaybackState>) =>
    set((state) => {
      Object.assign(state.playback, playback);
    }),
});
