import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useShallow } from 'zustand/react/shallow';
import { Actor, Environment, Timeline, ProjectState, ProjectMeta } from '../types';

/**
 * Playback state for the scene.
 */
export interface PlaybackState {
  /** Current playback time in seconds. */
  currentTime: number;
  /** Whether the scene is currently playing. */
  isPlaying: boolean;
  /** Frame rate for playback (e.g., 24, 30, 60). */
  frameRate: number;
  /** Playback speed multiplier (1.0 = normal). */
  speed: number;
  /** Whether to loop the animation when it reaches the end. */
  loop: boolean;
}

/**
 * State and actions for the scene store.
 */
export interface SceneStoreState extends ProjectState {
  // Runtime state
  playback: PlaybackState;
  /** The ID of the currently selected actor, or null if none selected. */
  selectedActorId: string | null;

  // Actions
  /** Adds a new actor to the scene. */
  addActor: (actor: Actor) => void;
  /** Removes an actor from the scene by ID. */
  removeActor: (actorId: string) => void;
  /** Updates properties of an existing actor. */
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  /** Updates the scene environment settings. */
  setEnvironment: (environment: Partial<Environment>) => void;
  /** Updates the timeline configuration. */
  setTimeline: (timeline: Partial<Timeline>) => void;
  /** Updates playback state (play/pause, time, etc.). */
  setPlayback: (playback: Partial<PlaybackState>) => void;
  /** Sets the currently selected actor. */
  setSelectedActor: (id: string | null) => void;
}

const initialMeta: ProjectMeta = {
  title: 'Untitled Project',
  version: '1.0.0',
};

const initialEnvironment: Environment = {
  ambientLight: { intensity: 0.5, color: '#ffffff' },
  sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
  skyColor: '#87CEEB',
};

const initialTimeline: Timeline = {
  duration: 10,
  cameraTrack: [],
  animationTracks: [],
};

const initialState: ProjectState & { playback: PlaybackState; selectedActorId: string | null } = {
  meta: initialMeta,
  environment: initialEnvironment,
  actors: [],
  timeline: initialTimeline,
  library: { clips: [] },
  playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, loop: false },
  selectedActorId: null,
};

/**
 * Zustand store for managing the scene state, including actors, timeline, environment, and playback.
 * Uses `immer` for immutable updates, `persist` for local storage, and `temporal` (zundo) for undo/redo.
 *
 * @example
 * ```tsx
 * const { actors, addActor, undo, redo } = useSceneStore()
 * ```
 */
export const useSceneStore = create<SceneStoreState>()(
  temporal(
    persist(
      immer((set) => ({
        ...initialState,

        addActor: (actor) =>
          set((state) => {
            state.actors.push(actor);
          }),

        removeActor: (actorId) =>
          set((state) => {
            state.actors = state.actors.filter((a) => a.id !== actorId);
            if (state.selectedActorId === actorId) {
              state.selectedActorId = null;
            }
          }),

        updateActor: (actorId, updates) =>
          set((state) => {
            const actor = state.actors.find((a) => a.id === actorId);
            if (actor) {
              Object.assign(actor, updates);
            }
          }),

        setEnvironment: (environment) =>
          set((state) => {
            Object.assign(state.environment, environment);
          }),

        setTimeline: (timeline) =>
          set((state) => {
            Object.assign(state.timeline, timeline);
          }),

        setPlayback: (playback) =>
          set((state) => {
            Object.assign(state.playback, playback);
          }),

        setSelectedActor: (id) =>
          set((state) => {
            state.selectedActorId = id;
          }),
      })),
      {
        name: 'animatica-scene',
        // Only persist project state, not playback or selection
        partialize: (state) => {
          const { playback, selectedActorId, ...rest } = state;
          return rest as unknown as SceneStoreState; // Typescript workaround for partialize return type
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

// Selectors

/**
 * Selector to get an actor by its ID.
 * @param id The UUID of the actor.
 * @returns The actor object if found, otherwise undefined.
 */
export const getActorById = (id: string) => (state: SceneStoreState): Actor | undefined =>
  state.actors.find((a) => a.id === id);

/**
 * Hook to select a specific actor by ID.
 * @param id The UUID of the actor.
 */
export const useActorById = (id: string) => useSceneStore((state) => state.actors.find((a) => a.id === id));

/**
 * Selector to get all currently visible actors.
 * @returns An array of visible actors.
 */
export const getActiveActors = (state: SceneStoreState): Actor[] =>
  state.actors.filter((a) => a.visible);

/**
 * Selector to get the current playback time.
 * @returns The current time in seconds.
 */
export const getCurrentTime = (state: SceneStoreState): number =>
  state.playback.currentTime;

/**
 * Hook to get the currently selected actor.
 */
export const useSelectedActor = () =>
  useSceneStore((state) =>
    state.selectedActorId ? state.actors.find((a) => a.id === state.selectedActorId) : undefined
  );

/**
 * Hook to get all actors of a specific type.
 * @param type The type of actor to filter by.
 */
export const useActorsByType = (type: Actor['type']) =>
  useSceneStore(useShallow((state) => state.actors.filter((a) => a.type === type)));

/**
 * Hook to get the list of all actors.
 */
export const useActorList = () => useSceneStore((state) => state.actors);
