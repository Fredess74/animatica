/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useCallback, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { LoopMode } from '../store/types';

/**
 * Return type of the usePlayback hook.
 */
export interface PlaybackControls {
    /** Start or resume playback. */
    play: () => void;
    /** Pause playback. */
    pause: () => void;
    /** Stop playback and reset to start. */
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
 */
export function usePlayback(): PlaybackControls {
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);

    // Subscribe to playback state changes
    const isPlaying = useSceneStore((s) => s.playback.isPlaying);
    const playbackSpeed = useSceneStore((s) => s.playback.speed);
    const playbackDirection = useSceneStore((s) => s.playback.direction);
    const playbackLoopMode = useSceneStore((s) => s.playback.loopMode);
    const playbackDuration = useSceneStore((s) => s.timeline.duration);

    // Store latest values in refs for the loop
    const speedRef = useRef(playbackSpeed);
    const directionRef = useRef(playbackDirection);
    const loopModeRef = useRef(playbackLoopMode);
    const durationRef = useRef(playbackDuration);

    useEffect(() => {
        speedRef.current = playbackSpeed;
        directionRef.current = playbackDirection;
        loopModeRef.current = playbackLoopMode;
        durationRef.current = playbackDuration;
    }, [playbackSpeed, playbackDirection, playbackLoopMode, playbackDuration]);

    /**
     * The core animation frame callback.
     */
    const tick = useCallback(
        (timestamp: number) => {
            if (lastFrameTimeRef.current === null) {
                lastFrameTimeRef.current = timestamp;
            }

            const deltaMs = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;

            const speed = speedRef.current;
            const direction = directionRef.current;
            const loopMode = loopModeRef.current;
            const duration = durationRef.current;

            // Get current time directly from store to avoid stale closure if we used a prop
            // (Though we are setting it, so we need the latest)
            const currentTime = useSceneStore.getState().playback.currentTime;

            const deltaSec = (deltaMs / 1000) * speed * direction;
            let newTime = currentTime + deltaSec;

            // Handle boundaries and loop modes
            if (direction === 1 && newTime >= duration) {
                if (loopMode === 'loop') {
                    newTime = newTime % duration;
                } else if (loopMode === 'pingpong') {
                    newTime = duration;
                    useSceneStore.getState().setPlayback({ direction: -1, currentTime: newTime });
                    rafIdRef.current = requestAnimationFrame(tick);
                    return;
                } else {
                    // 'none': Stop at end
                    newTime = duration;
                    useSceneStore.getState().setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            } else if (direction === -1 && newTime <= 0) {
                 if (loopMode === 'loop') {
                    newTime = duration;
                } else if (loopMode === 'pingpong') {
                    newTime = 0;
                    useSceneStore.getState().setPlayback({ direction: 1, currentTime: newTime });
                    rafIdRef.current = requestAnimationFrame(tick);
                    return;
                } else {
                    // 'none': Stop at start
                    newTime = 0;
                    useSceneStore.getState().setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            }

            useSceneStore.getState().setPlayback({ currentTime: newTime });
            rafIdRef.current = requestAnimationFrame(tick);
        },
        []
    );

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
        };
    }, [isPlaying, tick]);

    const play = useCallback(() => {
        const { currentTime, direction } = useSceneStore.getState().playback;
        const { duration } = useSceneStore.getState().timeline;

        // Auto-rewind if at end
        if (direction === 1 && currentTime >= duration) {
            useSceneStore.getState().setPlayback({ currentTime: 0, isPlaying: true });
        } else if (direction === -1 && currentTime <= 0) {
             useSceneStore.getState().setPlayback({ currentTime: duration, isPlaying: true });
        } else {
             useSceneStore.getState().setPlayback({ isPlaying: true });
        }
    }, []);

    const pause = useCallback(() => {
        useSceneStore.getState().setPlayback({ isPlaying: false });
    }, []);

    const stop = useCallback(() => {
        useSceneStore.getState().setPlayback({ currentTime: 0, isPlaying: false, direction: 1 });
    }, []);

    const seek = useCallback((time: number) => {
        const { duration } = useSceneStore.getState().timeline;
        const clampedTime = Math.max(0, Math.min(time, duration));
        useSceneStore.getState().setPlayback({ currentTime: clampedTime });
    }, []);

    const toggle = useCallback(() => {
        const playing = useSceneStore.getState().playback.isPlaying;
        if (playing) pause();
        else play();
    }, [play, pause]);

    const setSpeed = useCallback((speed: number) => {
         // Clamp speed to avoid crazy values or negatives if not intended
         useSceneStore.getState().setPlayback({ speed: Math.max(0.1, Math.min(speed, 10)) });
    }, []);

    const setLoopMode = useCallback((mode: LoopMode) => {
        useSceneStore.getState().setPlayback({ loopMode: mode });
    }, []);

    const nextFrame = useCallback(() => {
         const { frameRate, currentTime } = useSceneStore.getState().playback;
         const { duration } = useSceneStore.getState().timeline;
         const frameDuration = 1 / (frameRate || 24);
         const newTime = Math.min(duration, currentTime + frameDuration);
         useSceneStore.getState().setPlayback({ currentTime: newTime, isPlaying: false });
    }, []);

    const prevFrame = useCallback(() => {
         const { frameRate, currentTime } = useSceneStore.getState().playback;
         const frameDuration = 1 / (frameRate || 24);
         const newTime = Math.max(0, currentTime - frameDuration);
         useSceneStore.getState().setPlayback({ currentTime: newTime, isPlaying: false });
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
