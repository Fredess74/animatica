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
    /** Whether to loop the animation when it reaches the end. Default: uses store value (default 'none'). */
    loopMode?: LoopMode;
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
    /** Set the loop mode. */
    setLoopMode: (mode: LoopMode) => void;
    /** Advance by one frame. */
    nextFrame: () => void;
    /** Go back by one frame. */
    prevFrame: () => void;
    /** Jump to the next marker. */
    nextMarker: () => void;
    /** Jump to the previous marker. */
    prevMarker: () => void;
}

/**
 * React hook that provides playback controls for the scene animation.
 * Uses requestAnimationFrame for smooth, frame-accurate playback.
 *
 * @param options Optional playback configuration.
 * @returns PlaybackControls object with play, pause, stop, seek, toggle, setSpeed, etc.
 *
 * @example
 * ```tsx
 * function ControlBar() {
 *   const { play, pause, stop, seek, toggle } = usePlayback({ loopMode: 'loop' });
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
    const { loopMode: initialLoopMode } = options;
    const speedRef = useRef(options.speed ?? 1.0);
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const directionRef = useRef<number>(1); // 1 for forward, -1 for backward

    const setPlayback = useSceneStore((s) => s.setPlayback);
    const isPlaying = useSceneStore((s) => s.playback.isPlaying);
    const duration = useSceneStore((s) => s.timeline.duration);
    const frameRate = useSceneStore((s) => s.playback.frameRate);
    const loopMode = useSceneStore((s) => s.playback.loopMode);
    const markers = useSceneStore((s) => s.timeline.markers);

    // Initialize loopMode if provided
    useEffect(() => {
        if (initialLoopMode) {
            setPlayback({ loopMode: initialLoopMode });
        }
    }, [initialLoopMode, setPlayback]);

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

            // Convert to seconds and apply speed multiplier and direction
            const deltaSec = (deltaMs / 1000) * speedRef.current * directionRef.current;

            // Get the current state from the store
            const state = useSceneStore.getState();
            const currentLoopMode = state.playback.loopMode;
            let newTime = state.playback.currentTime + deltaSec;

            // Handle end of timeline (forward)
            if (directionRef.current === 1 && newTime >= duration) {
                if (currentLoopMode === 'loop') {
                    newTime = newTime % duration;
                } else if (currentLoopMode === 'pingpong') {
                    newTime = duration - (newTime - duration);
                    directionRef.current = -1;
                } else { // 'none'
                    newTime = duration;
                    setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            }
            // Handle start of timeline (backward)
            else if (directionRef.current === -1 && newTime <= 0) {
                if (currentLoopMode === 'loop') {
                    // In loop mode, reverse playback wraps to end
                    newTime = duration + newTime;
                } else if (currentLoopMode === 'pingpong') {
                    newTime = -newTime;
                    directionRef.current = 1;
                } else { // 'none'
                    newTime = 0;
                    setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    directionRef.current = 1; // Reset direction for next play
                    return;
                }
            }

            // Quantize to frame rate if desired (optional, for frame-snapping)
            // const frameDuration = 1 / frameRate;
            // const quantizedTime = Math.round(newTime / frameDuration) * frameDuration;

            setPlayback({ currentTime: newTime });

            // Schedule next frame
            rafIdRef.current = requestAnimationFrame(tick);
        },
        [duration, frameRate, setPlayback], // Dependencies
    );

    /**
     * Starts the animation loop.
     */
    const play = useCallback(() => {
        if (rafIdRef.current !== null) return; // Already playing

        const state = useSceneStore.getState();

        // If at the end and playing forward, reset to start
        if (state.playback.currentTime >= duration && directionRef.current === 1) {
            setPlayback({ currentTime: 0 });
        }
        // If at start and playing backward (unlikely unless set manually), reset?
        // Let's assume play() starts moving in the current direction.

        setPlayback({ isPlaying: true });
        lastFrameTimeRef.current = null;
        rafIdRef.current = requestAnimationFrame(tick);
    }, [duration, setPlayback, tick]);

    /**
     * Pauses the animation loop.
     */
    const pause = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        lastFrameTimeRef.current = null;
        setPlayback({ isPlaying: false });
    }, [setPlayback]);

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
        setPlayback({ currentTime: 0, isPlaying: false });
    }, [setPlayback]);

    /**
     * Seeks to a specific time in seconds.
     */
    const seek = useCallback(
        (time: number) => {
            const clampedTime = Math.max(0, Math.min(time, duration));
            setPlayback({ currentTime: clampedTime });
        },
        [duration, setPlayback],
    );

    /**
     * Toggles between play and pause.
     */
    const toggle = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    /**
     * Sets the playback speed multiplier.
     */
    const setSpeed = useCallback((speed: number) => {
        speedRef.current = Math.max(0.1, Math.min(speed, 10));
    }, []);

    /**
     * Sets the loop mode.
     */
    const setLoopMode = useCallback((mode: LoopMode) => {
        setPlayback({ loopMode: mode });
    }, [setPlayback]);

    /**
     * Advances by one frame.
     */
    const nextFrame = useCallback(() => {
        pause(); // Ensure paused
        const state = useSceneStore.getState();
        const frameDuration = 1 / state.playback.frameRate;
        const newTime = Math.min(state.playback.currentTime + frameDuration, duration);
        setPlayback({ currentTime: newTime });
    }, [duration, pause, setPlayback]);

    /**
     * Goes back by one frame.
     */
    const prevFrame = useCallback(() => {
        pause(); // Ensure paused
        const state = useSceneStore.getState();
        const frameDuration = 1 / state.playback.frameRate;
        const newTime = Math.max(state.playback.currentTime - frameDuration, 0);
        setPlayback({ currentTime: newTime });
    }, [pause, setPlayback]);

    /**
     * Jump to the next marker.
     */
    const nextMarker = useCallback(() => {
        const state = useSceneStore.getState();
        const currentTime = state.playback.currentTime;
        const sortedMarkers = [...state.timeline.markers].sort((a, b) => a.time - b.time);

        const next = sortedMarkers.find(m => m.time > currentTime + 0.01); // +0.01 tolerance
        if (next) {
            seek(next.time);
        } else {
            // If no next marker, maybe jump to end? Or loop to first?
            // Standard behavior: do nothing or loop to first.
            // Let's loop to first if present
            if (sortedMarkers.length > 0) {
                 seek(sortedMarkers[0].time);
            }
        }
    }, [seek]);

    /**
     * Jump to the previous marker.
     */
    const prevMarker = useCallback(() => {
        const state = useSceneStore.getState();
        const currentTime = state.playback.currentTime;
        const sortedMarkers = [...state.timeline.markers].sort((a, b) => a.time - b.time);

        // Find last marker with time < current
        const prev = [...sortedMarkers].reverse().find(m => m.time < currentTime - 0.01);
        if (prev) {
            seek(prev.time);
        } else {
             // Loop to last
             if (sortedMarkers.length > 0) {
                 seek(sortedMarkers[sortedMarkers.length - 1].time);
             }
        }
    }, [seek]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    return {
        play, pause, stop, seek, toggle,
        setSpeed, setLoopMode,
        nextFrame, prevFrame,
        nextMarker, prevMarker
    };
}
