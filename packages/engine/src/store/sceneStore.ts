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
        library: { clips: [] },
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

/**
 * Selector to get the timeline state.
 */
export const getTimeline = (state: SceneStoreState) => state.timeline;

/**
 * Selector to get the environment state.
 */
export const getEnvironment = (state: SceneStoreState) => state.environment;

/**
 * Selector to get the playback state.
 */
export const getPlaybackState = (state: SceneStoreState) => state.playback;

/**
 * Selector to get the project metadata.
 */
export const getMeta = (state: SceneStoreState) => state.meta;

/**
 * Selector to get the library state.
 */
export const getLibrary = (state: SceneStoreState) => state.library;

// Hooks

/**
 * Hook to get the entire environment state.
 * Optimized with useShallow to prevent re-renders unless properties change.
 */
export const useEnvironment = () =>
  useSceneStore(useShallow((state) => state.environment));

/**
 * Hook to get the ambient light settings.
 * Optimized with useShallow.
 */
export const useAmbientLight = () =>
  useSceneStore(useShallow((state) => state.environment.ambientLight));

/**
 * Hook to get the sun settings.
 * Optimized with useShallow.
 */
export const useSun = () =>
  useSceneStore(useShallow((state) => state.environment.sun));

/**
 * Hook to get the sky color.
 */
export const useSkyColor = () =>
  useSceneStore((state) => state.environment.skyColor);

/**
 * Hook to get the fog settings.
 * Optimized with useShallow.
 */
export const useFog = () =>
  useSceneStore(useShallow((state) => state.environment.fog));

/**
 * Hook to get the entire timeline state.
 * Optimized with useShallow.
 */
export const useTimeline = () =>
  useSceneStore(useShallow((state) => state.timeline));

/**
 * Hook to get the animation tracks.
 * Optimized with useShallow.
 */
export const useAnimationTracks = () =>
  useSceneStore(useShallow((state) => state.timeline.animationTracks));

/**
 * Hook to get the camera track.
 * Optimized with useShallow.
 */
export const useCameraTrack = () =>
  useSceneStore(useShallow((state) => state.timeline.cameraTrack));

/**
 * Hook to get timeline metadata (duration and markers).
 * Optimized with useShallow.
 */
export const useTimelineMetadata = () =>
  useSceneStore(
    useShallow((state) => ({
      duration: state.timeline.duration,
      markers: state.timeline.markers,
    }))
  );

/**
 * Hook to get the entire playback state.
 * Optimized with useShallow.
 */
export const usePlaybackState = () =>
  useSceneStore(useShallow((state) => state.playback));

/**
 * Hook to get the project metadata.
 * Optimized with useShallow.
 */
export const useMeta = () =>
  useSceneStore(useShallow((state) => state.meta));

/**
 * Hook to get the library state.
 * Optimized with useShallow.
 */
export const useLibrary = () =>
  useSceneStore(useShallow((state) => state.library));

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
export const useActorList = () => useSceneStore((state) => state.actors);
