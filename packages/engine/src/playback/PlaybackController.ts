/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useEffect, useRef, useCallback } from 'react';
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
    const isPlaying = useSceneStore((state) => state.playback.isPlaying);
    const speed = useSceneStore((state) => state.playback.speed);
    const loopMode = useSceneStore((state) => state.playback.loopMode);
    const direction = useSceneStore((state) => state.playback.direction);
    const currentTime = useSceneStore((state) => state.playback.currentTime);
    const duration = useSceneStore((state) => state.timeline.duration);

    const setPlayback = useSceneStore((state) => state.setPlayback);

    // Store latest values in refs to access them in the RAF callback without recreating it
    const playbackStateRef = useRef({
        isPlaying,
        speed,
        loopMode,
        direction,
        currentTime,
        duration
    });

    useEffect(() => {
        playbackStateRef.current = {
            isPlaying,
            speed,
            loopMode,
            direction,
            currentTime,
            duration
        };
    }, [isPlaying, speed, loopMode, direction, currentTime, duration]);

    /**
     * The core animation frame callback.
     * Calculates delta time and advances the store's currentTime.
     */
    const tick = useCallback((timestamp: number) => {
        if (lastFrameTimeRef.current === null) {
            lastFrameTimeRef.current = timestamp;
        }

        const deltaMs = timestamp - lastFrameTimeRef.current;

        // Cap delta to prevent large jumps (e.g. tab switching)
        const safeDeltaMs = Math.min(deltaMs, 100);

        lastFrameTimeRef.current = timestamp;

        const { speed, direction, loopMode, currentTime, duration, isPlaying } = playbackStateRef.current;

        if (!isPlaying) {
            rafIdRef.current = null;
            return;
        }

        // Convert to seconds and apply speed multiplier and direction
        const deltaSec = (safeDeltaMs / 1000) * speed * direction;
        let newTime = currentTime + deltaSec;

        // Handle boundaries and loop modes
        if (direction === 1 && newTime >= duration) {
            if (loopMode === 'loop') {
                newTime = newTime % duration;
                setPlayback({ currentTime: newTime });
            } else if (loopMode === 'pingpong') {
                newTime = duration;
                setPlayback({ currentTime: newTime, direction: -1 });
            } else {
                // 'none': Stop at end
                newTime = duration;
                setPlayback({ currentTime: newTime, isPlaying: false });
                rafIdRef.current = null;
                lastFrameTimeRef.current = null;
                return;
            }
        } else if (direction === -1 && newTime <= 0) {
             if (loopMode === 'loop') {
                newTime = duration;
                setPlayback({ currentTime: newTime });
            } else if (loopMode === 'pingpong') {
                newTime = 0;
                setPlayback({ currentTime: newTime, direction: 1 });
            } else {
                // 'none': Stop at start
                newTime = 0;
                setPlayback({ currentTime: newTime, isPlaying: false });
                rafIdRef.current = null;
                lastFrameTimeRef.current = null;
                return;
            }
        } else {
             setPlayback({ currentTime: newTime });
        }

        // Schedule next frame
        rafIdRef.current = requestAnimationFrame(tick);
    }, [setPlayback]);

    // Effect to start/stop loop based on isPlaying state changes
    useEffect(() => {
        if (isPlaying) {
            if (rafIdRef.current === null) {
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
        const { currentTime, duration, direction } = playbackStateRef.current;

        // If at the end and playing forward, reset to start
        if (direction === 1 && currentTime >= duration) {
            setPlayback({ currentTime: 0, isPlaying: true });
        }
        // If at start and playing backward, reset to end
        else if (direction === -1 && currentTime <= 0) {
             setPlayback({ currentTime: duration, isPlaying: true });
        } else {
             setPlayback({ isPlaying: true });
        }
    }, [setPlayback]);

    const pause = useCallback(() => {
        setPlayback({ isPlaying: false });
    }, [setPlayback]);

    const stop = useCallback(() => {
        setPlayback({ currentTime: 0, isPlaying: false, direction: 1 });
    }, [setPlayback]);

    const seek = useCallback((time: number) => {
        const { duration } = playbackStateRef.current;
        const clampedTime = Math.max(0, Math.min(time, duration));
        setPlayback({ currentTime: clampedTime });
    }, [setPlayback]);

    const toggle = useCallback(() => {
        if (playbackStateRef.current.isPlaying) {
            pause();
        } else {
            play();
        }
    }, [play, pause]);

    const setPlaybackSpeed = useCallback((speed: number) => {
         setPlayback({ speed: Math.max(0.1, Math.min(speed, 10)) });
    }, [setPlayback]);

    const setLoop = useCallback((mode: LoopMode) => {
        setPlayback({ loopMode: mode });
    }, [setPlayback]);

    const nextFrame = useCallback(() => {
         const { frameRate, currentTime } = useSceneStore.getState().playback;
         const { duration } = useSceneStore.getState().timeline;
         const frameDuration = 1 / (frameRate || 24);
         const newTime = Math.min(duration, currentTime + frameDuration);
         setPlayback({ currentTime: newTime, isPlaying: false });
    }, [setPlayback]);

    const prevFrame = useCallback(() => {
         const { frameRate, currentTime } = useSceneStore.getState().playback;
         const frameDuration = 1 / (frameRate || 24);
         const newTime = Math.max(0, currentTime - frameDuration);
         setPlayback({ currentTime: newTime, isPlaying: false });
    }, [setPlayback]);

    return {
        play,
        pause,
        stop,
        seek,
        toggle,
        setSpeed: setPlaybackSpeed,
        setLoopMode: setLoop,
        nextFrame,
        prevFrame
    };
}
