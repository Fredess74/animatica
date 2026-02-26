import { useCallback, useEffect, useRef } from 'react';
import { useSceneStore, type LoopMode } from '../store/sceneStore';

/**
 * Return type of the usePlayback hook.
 */
export interface PlaybackControls {
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
    /** Move to the next frame. */
    nextFrame: () => void;
    /** Move to the previous frame. */
    prevFrame: () => void;
}

/**
 * React hook that provides playback controls for the scene animation.
 * Uses requestAnimationFrame for smooth, frame-accurate playback.
 *
 * Note: This hook also manages the animation loop. It should ideally be used
 * by a single controller component to avoid multiple loops running simultaneously.
 *
 * @returns PlaybackControls object.
 */
export function usePlayback(): PlaybackControls {
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);

    // Subscribe to playback state changes
    const isPlaying = useSceneStore((s) => s.playback.isPlaying);

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
            const { currentTime, speed, direction, loopMode } = state.playback;

            // Convert to seconds and apply speed multiplier and direction
            const deltaSec = (deltaMs / 1000) * speed * direction;
            let newTime = currentTime + deltaSec;

            // Handle boundaries and loop modes
            if (direction === 1 && newTime >= duration) {
                if (loopMode === 'loop') {
                    newTime = newTime % duration;
                    state.setPlayback({ currentTime: newTime });
                } else if (loopMode === 'pingpong') {
                    newTime = duration;
                    // Reverse direction
                    state.setPlayback({ direction: -1, currentTime: newTime });
                } else {
                    // 'none': Stop at end
                    newTime = duration;
                    state.setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            } else if (direction === -1 && newTime <= 0) {
                 if (loopMode === 'loop') {
                    // Loop backwards? usually loop wraps to end
                    newTime = duration;
                    state.setPlayback({ currentTime: newTime });
                } else if (loopMode === 'pingpong') {
                    newTime = 0;
                    // Reverse direction
                    state.setPlayback({ direction: 1, currentTime: newTime });
                } else {
                    // 'none': Stop at start
                    newTime = 0;
                    state.setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            } else {
                state.setPlayback({ currentTime: newTime });
            }

            // Schedule next frame
            rafIdRef.current = requestAnimationFrame(tick);
        },
        []
    );

    // Effect to start/stop loop based on isPlaying state changes
    useEffect(() => {
        if (isPlaying) {
            if (rafIdRef.current === null) {
                // Reset lastFrameTime so the first tick doesn't calculate a huge delta
                lastFrameTimeRef.current = null;
                rafIdRef.current = requestAnimationFrame(tick);
            }
        } else {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            lastFrameTimeRef.current = null;
        }

        return () => {
             if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }
    }, [isPlaying, tick]);

    const play = useCallback(() => {
        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const { currentTime, direction } = state.playback;

        // If at the end and playing forward, reset to start
        if (direction === 1 && currentTime >= duration) {
            state.setPlayback({ currentTime: 0, isPlaying: true });
        }
        // If at start and playing backward, reset to end
        else if (direction === -1 && currentTime <= 0) {
             state.setPlayback({ currentTime: duration, isPlaying: true });
        } else {
             state.setPlayback({ isPlaying: true });
        }
    }, []);

    const pause = useCallback(() => {
        useSceneStore.getState().setPlayback({ isPlaying: false });
    }, []);

    const stop = useCallback(() => {
        useSceneStore.getState().setPlayback({ currentTime: 0, isPlaying: false, direction: 1 });
    }, []);

    const seek = useCallback((time: number) => {
        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const clampedTime = Math.max(0, Math.min(time, duration));
        state.setPlayback({ currentTime: clampedTime });
    }, []);

    const toggle = useCallback(() => {
        const playing = useSceneStore.getState().playback.isPlaying;
        if (playing) {
            pause();
        } else {
            play();
        }
    }, [play, pause]);

    const setSpeed = useCallback((speed: number) => {
         useSceneStore.getState().setPlayback({ speed: Math.max(0.1, Math.min(speed, 10)) });
    }, []);

    const setLoopMode = useCallback((mode: LoopMode) => {
        useSceneStore.getState().setPlayback({ loopMode: mode });
    }, []);

    const nextFrame = useCallback(() => {
         const state = useSceneStore.getState();
         const { frameRate, currentTime } = state.playback;
         const frameDuration = 1 / (frameRate || 24);
         const { duration } = state.timeline;
         const newTime = Math.min(duration, currentTime + frameDuration);
         state.setPlayback({ currentTime: newTime, isPlaying: false });
    }, []);

    const prevFrame = useCallback(() => {
         const state = useSceneStore.getState();
         const { frameRate, currentTime } = state.playback;
         const frameDuration = 1 / (frameRate || 24);
         const newTime = Math.max(0, currentTime - frameDuration);
         state.setPlayback({ currentTime: newTime, isPlaying: false });
    }, []);

    return {
        play,
        pause,
        stop,
        seek,
        toggle,
        setSpeed,
        setLoopMode,
        nextFrame,
        prevFrame
    };
}
