import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useShallow } from 'zustand/react/shallow';
import { Actor, ProjectMeta } from '../types';
import { EngineStoreState } from './types';
import { createActorsSlice } from './slices/actorsSlice';
import { createEnvironmentSlice } from './slices/environmentSlice';
import { createTimelineSlice } from './slices/timelineSlice';
import { createPlaybackSlice } from './slices/playbackSlice';

const initialMeta: ProjectMeta = {
  title: 'Untitled Project',
  version: '1.0.0',
};

/**
 * Zustand store for managing the scene state, including actors, timeline, environment, and playback.
 * Uses `immer` for immutable updates, `persist` for local storage, and `temporal` (zundo) for undo/redo.
 */
export const useEngineStore = create<EngineStoreState>()(
  temporal(
    persist(
      immer((...a) => ({
        meta: initialMeta,
        library: { clips: [] },
        ...createActorsSlice(...a),
        ...createEnvironmentSlice(...a),
        ...createTimelineSlice(...a),
        ...createPlaybackSlice(...a),
      })),
      {
        name: 'animatica-scene',
        // Only persist project state, not playback or selection
        partialize: (state) => {
          const { playback, selectedActorId, ...rest } = state;
          return rest as any;
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
      limit: 100,
    }
  )
);

// Backward compatibility alias
/** @deprecated Use useEngineStore instead */
export const useSceneStore = useEngineStore;

// Selectors

/**
 * Selector to get an actor by its ID.
 * @param id The UUID of the actor.
 * @returns The actor object if found, otherwise undefined.
 */
export const getActorById = (id: string) => (state: EngineStoreState): Actor | undefined =>
  state.actors.find((a) => a.id === id);

/**
 * Hook to select a specific actor by ID.
 * @param id The UUID of the actor.
 */
export const useActorById = (id: string) => useEngineStore((state) => state.actors.find((a) => a.id === id));

/**
 * Selector to get all currently visible actors.
 * @returns An array of visible actors.
 */
export const getActiveActors = (state: EngineStoreState): Actor[] =>
  state.actors.filter((a) => a.visible);

/**
 * Selector to get the current playback time.
 * @returns The current time in seconds.
 */
export const getCurrentTime = (state: EngineStoreState): number =>
  state.playback.currentTime;

/**
 * Hook to get the currently selected actor.
 */
export const useSelectedActor = () =>
  useEngineStore((state) =>
    state.selectedActorId ? state.actors.find((a) => a.id === state.selectedActorId) : undefined
  );

/**
 * Hook to get all actors of a specific type.
 * @param type The type of actor to filter by.
 */
export const useActorsByType = (type: Actor['type']) =>
  useEngineStore(useShallow((state) => state.actors.filter((a) => a.type === type)));

/**
 * Hook to get the list of all actors.
 */
export const useActorList = () => useEngineStore((state) => state.actors);

/**
 * Hook to get only the current playback time.
 * Prevents re-renders when other playback properties change.
 */
export const useCurrentTime = () => useEngineStore((state) => state.playback.currentTime);

/**
 * Hook to get only the current playing status.
 */
export const useIsPlaying = () => useEngineStore((state) => state.playback.isPlaying);

/**
 * Hook to get all actors' IDs.
 * Useful for list components that only need IDs to render children.
 */
export const useActorIds = () =>
  useEngineStore(useShallow((state) => state.actors.map((a) => a.id)));

/**
 * Hook to get playback actions.
 */
export const usePlaybackActions = () => useEngineStore((state) => state.setPlayback);

/**
 * Hook to get actor actions.
 */
export const useActorActions = () =>
  useEngineStore(
    useShallow((state) => ({
      addActor: state.addActor,
      removeActor: state.removeActor,
      updateActor: state.updateActor,
      setSelectedActor: state.setSelectedActor,
    }))
  );
