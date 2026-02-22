import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { EngineStoreState } from './types';
import { createActorsSlice } from './slices/actorsSlice';
import { createTimelineSlice } from './slices/timelineSlice';
import { createEnvironmentSlice } from './slices/environmentSlice';
import { createPlaybackSlice } from './slices/playbackSlice';
import { createProjectSlice } from './slices/projectSlice';

/**
 * Main Zustand store for the Animation Engine.
 * Combines all slices (actors, timeline, environment, playback, project)
 * and uses Immer middleware for immutable state updates.
 */
export const useEngineStore = create<EngineStoreState>()(
  immer((...a) => ({
    ...createActorsSlice(...a),
    ...createTimelineSlice(...a),
    ...createEnvironmentSlice(...a),
    ...createPlaybackSlice(...a),
    ...createProjectSlice(...a),
  }))
);

// Selectors

/**
 * Selector to get an actor by its ID.
 * @param id - The ID of the actor to find
 */
export const getActorById = (id: string) => (state: EngineStoreState) =>
  state.actors.find((a) => a.id === id);

/**
 * Selector to get all visible actors.
 */
export const getActiveActors = (state: EngineStoreState) =>
  state.actors.filter((a) => a.visible);

/**
 * Selector to get the current playback time.
 */
export const getCurrentTime = (state: EngineStoreState) =>
  state.playback.currentTime;
