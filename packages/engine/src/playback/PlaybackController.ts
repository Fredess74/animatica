/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useCallback, useEffect, useRef } from 'react';
import { useEngineStore } from '../store/useEngineStore';

/**
 * Options for customizing playback behavior.
 */
interface PlaybackOptions {
    /** Whether to loop the animation when it reaches the end. Default: false. */
    loop?: boolean;
    /** Playback speed multiplier (1.0 = normal). Default: 1.0. */
    speed?: number;
}

/**
 * Return type of the usePlayback hook.
 */
interface PlaybackControls {
    /** Start or resume playback from the current time. */
    play: () => void;
    /** Pause playback at the current time. */
    pause: () => void;
    /** Stop playback and reset to time 0. */
    stop: () => void;
    /** Seek to a specific time in seconds. */
    seek: (time: number) => void;
    /** Toggle between play and pause. */
    toggle: () => void;
    /** Set playback speed multiplier. */
    setSpeed: (speed: number) => void;
}

/**
 * React hook that provides playback controls for the scene animation.
 * Uses requestAnimationFrame for smooth, frame-accurate playback.
 *
 * @param options Optional playback configuration.
 * @returns PlaybackControls object with play, pause, stop, seek, toggle, setSpeed.
 *
 * @example
 * ```tsx
 * function ControlBar() {
 *   const { play, pause, stop, seek, toggle } = usePlayback({ loop: true });
 *   return (
 *     <div>
 *       <button onClick={toggle}>Play/Pause</button>
 *       <button onClick={stop}>Stop</button>
 *       <input type="range" onChange={(e) => seek(Number(e.target.value))} />
 *     </div>
 *   );
 * }
 * ```
 */
export function usePlayback(options: PlaybackOptions = {}): PlaybackControls {
    const { loop = false, speed = 1.0 } = options;

    // Use refs to avoid stale closures in the animation loop
    const loopRef = useRef(loop);
    const speedRef = useRef(speed);
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);

    // Sync refs with props
    useEffect(() => {
        loopRef.current = loop;
    }, [loop]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    // We subscribe to isPlaying only to trigger re-renders if the component needs to know.
    // However, the hook returns controls, not state.
    // If the component needs state, it should use useSceneStore separately.
    // But typically usePlayback is used in a component that might change appearance based on isPlaying.
    // The original implementation subscribed.
    // To match original behavior (re-render on change), we keep the subscription,
    // but we use underscores to ignore unused variable linting if we don't return it?
    // The original hook returned { play, ... } but NOT isPlaying.
    // The components using this hook might expect it to trigger re-render when playing starts/stops?
    // If we remove the subscription, the component won't re-render.
    // But usePlayback doesn't return isPlaying.
    // So the component doesn't know.
    // Unless usePlayback is used alongside useEngineStore.
    // I will remove the unused variable. If re-render is needed, the component should subscribe itself.
    useEngineStore((s) => s.playback.isPlaying);

    /**
     * The core animation frame callback.
     * Calculates delta time and advances the store's currentTime.
     */
    const tick = useCallback(
        (timestamp: number) => {
            if (lastFrameTimeRef.current === null) {
                lastFrameTimeRef.current = timestamp;
            }

            const deltaMs = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;

            // Convert to seconds and apply speed multiplier
            const deltaSec = (deltaMs / 1000) * speedRef.current;

            // Get fresh state directly to avoid dependency chains
            const state = useEngineStore.getState();
            const { duration } = state.timeline;
            const { frameRate, currentTime } = state.playback;

            let newTime = currentTime + deltaSec;

            // Handle end of timeline
            if (newTime >= duration) {
                if (loopRef.current) {
                    newTime = newTime % duration;
                } else {
                    newTime = duration;
                    // Auto-pause at end
                    state.setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            }

            const targetFPS = frameRate || 24;
            const frameDuration = 1 / targetFPS;

            const quantizedTime = Math.round(newTime / frameDuration) * frameDuration;

            // Only update if time changed (prevent spamming store if delta is tiny)
            if (Math.abs(quantizedTime - currentTime) > 0.0001) {
                state.setPlayback({ currentTime: quantizedTime });
            }

            // Schedule next frame
            rafIdRef.current = requestAnimationFrame(tick);
        },
        [] // No dependencies! Reads everything from refs or store.getState()
    );

    /**
     * Starts the animation loop.
     */
    const play = useCallback(() => {
        if (rafIdRef.current !== null) return; // Already playing

        const state = useEngineStore.getState();
        const { duration } = state.timeline;
        const { currentTime } = state.playback;

        // If at the end, reset to start
        if (currentTime >= duration) {
            state.setPlayback({ currentTime: 0 });
        }

        state.setPlayback({ isPlaying: true });
        lastFrameTimeRef.current = null;
        rafIdRef.current = requestAnimationFrame(tick);
    }, [tick]); // tick is stable

    /**
     * Pauses the animation loop.
     */
    const pause = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        lastFrameTimeRef.current = null;

        // Update store
        useEngineStore.getState().setPlayback({ isPlaying: false });
    }, []);

    /**
     * Stops playback and resets to time 0.
     */
    const stop = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        lastFrameTimeRef.current = null;

        useEngineStore.getState().setPlayback({ currentTime: 0, isPlaying: false });
    }, []);

    /**
     * Seeks to a specific time in seconds.
     */
    const seek = useCallback(
        (time: number) => {
            const state = useEngineStore.getState();
            const { duration } = state.timeline;
            const clampedTime = Math.max(0, Math.min(time, duration));
            state.setPlayback({ currentTime: clampedTime });
        },
        []
    );

    /**
     * Toggles between play and pause.
     */
    const toggle = useCallback(() => {
        // Need to check current playing state from store or local ref?
        // We subscribe to isPlaying for UI, so we can use that.
        // But inside callback better to read fresh state to be safe.
        const playing = useEngineStore.getState().playback.isPlaying;
        if (playing) {
            pause();
        } else {
            play();
        }
    }, [play, pause]);

    /**
     * Sets the playback speed multiplier.
     */
    const setSpeedHandler = useCallback((newSpeed: number) => {
        speedRef.current = Math.max(0.1, Math.min(newSpeed, 10));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    return {
        play,
        pause,
        stop,
        seek,
        toggle,
        setSpeed: setSpeedHandler
    };
}
