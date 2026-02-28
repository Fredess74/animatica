import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useShallow } from 'zustand/react/shallow';
import { Actor } from '../types';
import { SceneStoreState } from './types';
import { createActorsSlice } from './slices/actorsSlice';
import { createEnvironmentSlice } from './slices/environmentSlice';
import { createTimelineSlice } from './slices/timelineSlice';
import { createPlaybackSlice } from './slices/playbackSlice';
import { createMetaSlice } from './slices/metaSlice';
import { createLibrarySlice } from './slices/librarySlice';

/**
 * Zustand store for managing the scene state, including actors, timeline, environment, and playback.
 * Uses `immer` for immutable updates, `persist` for local storage, and `temporal` (zundo) for undo/redo.
 * Optimized with a sliced architecture to improve maintainability.
 */
export const useSceneStore = create<SceneStoreState>()(
  temporal(
    persist(
      immer((...a) => ({
        ...createActorsSlice(...a),
        ...createEnvironmentSlice(...a),
        ...createTimelineSlice(...a),
        ...createPlaybackSlice(...a),
        ...createMetaSlice(...a),
        ...createLibrarySlice(...a),
      })),
      {
        name: 'animatica-scene',
        // Only persist project state, not playback or selection
        partialize: (state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { playback, selectedActorId, ...rest } = state;
          return rest as unknown as SceneStoreState;
        },
      }
    ),
    {
      // Only track undo/redo for project state
      partialize: (state) => ({
        actors: state.actors,
        environment: state.environment,
        timeline: state.timeline,
        meta: state.meta,
        library: state.library,
      }),
      equality: (a, b) => {
        if (a === b) return true;
        if (!a || !b) return false;
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        const keysA = Object.keys(aObj);
        const keysB = Object.keys(bObj);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
          if (aObj[key] !== bObj[key]) return false;
        }
        return true;
      },
      limit: 100, // Limit history size
    }
  )
);

// Re-export types
export type { SceneStoreState, PlaybackState, LoopMode } from './types';

// Selectors

/**
 * Selector to get an actor by its ID.
 */
export const getActorById = (id: string) => (state: SceneStoreState): Actor | undefined =>
  state.actors.find((a) => a.id === id);

/**
 * Selector to get all currently visible actors.
 */
export const getActiveActors = (state: SceneStoreState): Actor[] =>
  state.actors.filter((a) => a.visible);

/**
 * Selector to get the current playback time.
 */
export const getCurrentTime = (state: SceneStoreState): number =>
  state.playback.currentTime;

// Hooks

/**
 * Hook to select a specific actor by ID.
 */
export const useActorById = (id: string) =>
  useSceneStore((state) => state.actors.find((a) => a.id === id));

/**
 * Hook to get the list of all actor IDs.
 * Optimized with useShallow to prevent re-renders when actor properties change.
 */
export const useActorIds = () =>
  useSceneStore(useShallow((state) => state.actors.map((a) => a.id)));

/**
 * Hook to get the total number of actors in the scene.
 */
export const useActorCount = () =>
  useSceneStore((state) => state.actors.length);

/**
 * Hook to get the current playback time.
 */
export const useCurrentTime = () =>
  useSceneStore((state) => state.playback.currentTime);

/**
 * Hook to get the current playback playing status.
 */
export const useIsPlaying = () =>
  useSceneStore((state) => state.playback.isPlaying);

/**
 * Hook to get the ID of the currently selected actor.
 */
export const useSelectedActorId = () =>
  useSceneStore((state) => state.selectedActorId);

/**
 * Hook to get the currently selected actor.
 */
export const useSelectedActor = () =>
  useSceneStore((state) =>
    state.selectedActorId ? state.actors.find((a) => a.id === state.selectedActorId) : undefined
  );

/**
 * Hook to get all actors of a specific type.
 */
export const useActorsByType = (type: Actor['type']) =>
  useSceneStore(useShallow((state) => state.actors.filter((a) => a.type === type)));

/**
 * Hook to get the list of all actors.
 */
export const useActorList = () =>
  useSceneStore(useShallow((state) => state.actors));

/**
 * Hook to get the environment settings.
 */
export const useEnvironment = () =>
  useSceneStore(useShallow((state) => state.environment));

/**
 * Hook to get the timeline configuration.
 */
export const useTimeline = () =>
  useSceneStore(useShallow((state) => state.timeline));

/**
 * Hook to get the timeline duration.
 */
export const useTimelineDuration = () =>
  useSceneStore((state) => state.timeline.duration);

/**
 * Hook to get the timeline animation tracks.
 */
export const useTimelineAnimationTracks = () =>
  useSceneStore(useShallow((state) => state.timeline.animationTracks));

/**
 * Hook to get the timeline camera track.
 */
export const useTimelineCameraTrack = () =>
  useSceneStore(useShallow((state) => state.timeline.cameraTrack));

/**
 * Hook to get the playback state.
 */
export const usePlayback = () =>
  useSceneStore(useShallow((state) => state.playback));

/**
 * Hook to get the project metadata.
 */
export const useProjectMeta = () =>
  useSceneStore(useShallow((state) => state.meta));

/**
 * Hook to get the asset library.
 */
export const useLibrary = () =>
  useSceneStore(useShallow((state) => state.library));
