/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useCallback, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { LoopMode } from '../types';

/**
 * Options for customizing playback behavior.
 */
interface PlaybackOptions {
    // Legacy options deprecated in favor of store state
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
    /** Set the loop mode. */
    setLoopMode: (mode: LoopMode) => void;
    /** Step forward by one frame. */
    stepForward: () => void;
    /** Step backward by one frame. */
    stepBackward: () => void;
    /** Seek to the next marker. */
    seekToNextMarker: () => void;
    /** Seek to the previous marker. */
    seekToPrevMarker: () => void;
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
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const directionRef = useRef<1 | -1>(1); // 1 = forward, -1 = backward (for pingpong)

    // Subscribe to store updates if needed, though we read getState in tick
    useSceneStore((s) => s.playback.isPlaying);

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

            const state = useSceneStore.getState();
            const { duration } = state.timeline;
            const { frameRate, currentTime, speed, loopMode } = state.playback;

            // Convert to seconds and apply speed multiplier
            // directionRef is used for pingpong logic
            const deltaSec = (deltaMs / 1000) * speed * directionRef.current;

            let newTime = currentTime + deltaSec;

            // Handle end of timeline
            if (newTime >= duration) {
                if (loopMode === 'loop') {
                    newTime = newTime % duration;
                } else if (loopMode === 'pingpong') {
                    newTime = duration;
                    directionRef.current = -1;
                } else {
                    newTime = duration;
                    // Auto-pause at end
                    state.setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            } else if (newTime <= 0) {
                 if (loopMode === 'pingpong') {
                    newTime = 0;
                    directionRef.current = 1;
                } else if (loopMode === 'loop') {
                    newTime = duration;
                } else {
                    newTime = 0;
                    // If playing backward and hit 0, stop
                    if (directionRef.current === -1) {
                        state.setPlayback({ currentTime: newTime, isPlaying: false });
                        rafIdRef.current = null;
                        lastFrameTimeRef.current = null;
                        return;
                    }
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

        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const { currentTime } = state.playback;

        // If at the end, reset to start
        if (currentTime >= duration) {
            state.setPlayback({ currentTime: 0 });
            directionRef.current = 1;
        } else if (currentTime <= 0) {
            directionRef.current = 1;
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
        useSceneStore.getState().setPlayback({ isPlaying: false });
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
        directionRef.current = 1;

        useSceneStore.getState().setPlayback({ currentTime: 0, isPlaying: false });
    }, []);

    /**
     * Seeks to a specific time in seconds.
     */
    const seek = useCallback(
        (time: number) => {
            const state = useSceneStore.getState();
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
        const playing = useSceneStore.getState().playback.isPlaying;
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
        useSceneStore.getState().setPlayback({ speed: Math.max(0.1, Math.min(newSpeed, 10)) });
    }, []);

    /**
     * Sets the loop mode.
     */
    const setLoopModeHandler = useCallback((mode: LoopMode) => {
        useSceneStore.getState().setPlayback({ loopMode: mode });
    }, []);

    /**
     * Steps forward by one frame.
     */
    const stepForward = useCallback(() => {
        pause();
        const state = useSceneStore.getState();
        const { currentTime, frameRate } = state.playback;
        const { duration } = state.timeline;
        const frameTime = 1 / (frameRate || 24);
        const newTime = Math.min(currentTime + frameTime, duration);
        state.setPlayback({ currentTime: newTime });
    }, [pause]);

    /**
     * Steps backward by one frame.
     */
    const stepBackward = useCallback(() => {
        pause();
        const state = useSceneStore.getState();
        const { currentTime, frameRate } = state.playback;
        const frameTime = 1 / (frameRate || 24);
        const newTime = Math.max(currentTime - frameTime, 0);
        state.setPlayback({ currentTime: newTime });
    }, [pause]);

    /**
     * Seeks to the next marker on the timeline.
     */
    const seekToNextMarker = useCallback(() => {
        const state = useSceneStore.getState();
        const { currentTime } = state.playback;
        const { markers, duration } = state.timeline;

        const nextMarker = markers
            .filter((m) => m.time > currentTime + 0.001)
            .sort((a, b) => a.time - b.time)[0];

        if (nextMarker) {
            state.setPlayback({ currentTime: nextMarker.time });
        } else {
            state.setPlayback({ currentTime: duration });
        }
    }, []);

    /**
     * Seeks to the previous marker on the timeline.
     */
    const seekToPrevMarker = useCallback(() => {
        const state = useSceneStore.getState();
        const { currentTime } = state.playback;
        const { markers } = state.timeline;

        const prevMarker = markers
            .filter((m) => m.time < currentTime - 0.001)
            .sort((a, b) => b.time - a.time)[0];

        if (prevMarker) {
            state.setPlayback({ currentTime: prevMarker.time });
        } else {
            state.setPlayback({ currentTime: 0 });
        }
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
        setSpeed: setSpeedHandler,
        setLoopMode: setLoopModeHandler,
        stepForward,
        stepBackward,
        seekToNextMarker,
        seekToPrevMarker,
    };
}
