/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback
 */
import { useCallback, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';

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
    const { loop = false } = options;
    const speedRef = useRef(options.speed ?? 1.0);
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);

    const setPlayback = useSceneStore((s: { setPlayback: any }) => s.setPlayback);
    const isPlaying = useSceneStore((s: { playback: { isPlaying: boolean } }) => s.playback.isPlaying);
    const duration = useSceneStore((s: { timeline: { duration: number } }) => s.timeline.duration);
    const frameRate = useSceneStore((s: { playback: { frameRate: number } }) => s.playback.frameRate);

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

            // Get the current time from the store
            const state = useSceneStore.getState();
            let newTime = state.playback.currentTime + deltaSec;

            // Handle end of timeline
            if (newTime >= duration) {
                if (loop) {
                    newTime = newTime % duration;
                } else {
                    newTime = duration;
                    // Auto-pause at end
                    setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            }

            // Quantize to frame rate if desired (optional, for frame-snapping)
            const frameDuration = 1 / frameRate;
            const quantizedTime = Math.round(newTime / frameDuration) * frameDuration;

            setPlayback({ currentTime: quantizedTime });

            // Schedule next frame
            rafIdRef.current = requestAnimationFrame(tick);
        },
        [duration, frameRate, loop, setPlayback],
    );

    /**
     * Starts the animation loop.
     */
    const play = useCallback(() => {
        if (rafIdRef.current !== null) return; // Already playing

        // If at the end, reset to start
        const state = useSceneStore.getState();
        if (state.playback.currentTime >= duration) {
            setPlayback({ currentTime: 0 });
        }

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
        setPlayback({ currentTime: 0, isPlaying: false });
    }, [setPlayback]);

    /**
     * Seeks to a specific time in seconds.
     * @param time The time in seconds to seek to.
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
     * @param speed Speed multiplier (e.g. 1.0 for normal speed).
     */
    const setSpeed = useCallback((speed: number) => {
        speedRef.current = Math.max(0.1, Math.min(speed, 10));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    return { play, pause, stop, seek, toggle, setSpeed };
}
