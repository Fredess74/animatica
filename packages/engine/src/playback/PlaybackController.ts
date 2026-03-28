/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useCallback, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';
import type { LoopMode } from '../store/types';

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
 * @returns PlaybackControls object.
 */
export function usePlayback(): PlaybackControls {
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const tickRef = useRef<(timestamp: number) => void>(() => {});

    // Subscribe to playback state changes
    const isPlaying = useSceneStore((s) => s.playback.isPlaying);

    /**
     * The core animation frame callback logic.
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

            const deltaSec = (deltaMs / 1000) * speed * direction;
            let newTime = currentTime + deltaSec;

            if (direction === 1 && newTime >= duration) {
                if (loopMode === 'loop') {
                    newTime = newTime % duration;
                } else if (loopMode === 'pingpong') {
                    newTime = duration;
                    state.setPlayback({ direction: -1, currentTime: newTime });
                } else {
                    newTime = duration;
                    state.setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            } else if (direction === -1 && newTime <= 0) {
                if (loopMode === 'loop') {
                    newTime = duration;
                } else if (loopMode === 'pingpong') {
                    newTime = 0;
                    state.setPlayback({ direction: 1, currentTime: newTime });
                } else {
                    newTime = 0;
                    state.setPlayback({ currentTime: newTime, isPlaying: false });
                    rafIdRef.current = null;
                    lastFrameTimeRef.current = null;
                    return;
                }
            }

            if (Math.abs(newTime - currentTime) > 0.00001) {
                state.setPlayback({ currentTime: newTime });
            }

            rafIdRef.current = requestAnimationFrame(tickRef.current);
        },
        []
    );

    // Sync the ref to the latest tick function outside of render
    useEffect(() => {
        tickRef.current = tick;
    }, [tick]);

    useEffect(() => {
        if (isPlaying) {
            if (rafIdRef.current === null) {
                lastFrameTimeRef.current = null;
                rafIdRef.current = requestAnimationFrame(tickRef.current);
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
    }, [isPlaying]);

    const play = useCallback(() => {
        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const { currentTime, direction } = state.playback;

        if (direction === 1 && currentTime >= duration) {
            state.setPlayback({ currentTime: 0, isPlaying: true });
        }
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

    const seek = useCallback(
        (time: number) => {
            const state = useSceneStore.getState();
            const { duration } = state.timeline;
            const clampedTime = Math.max(0, Math.min(time, duration));
            state.setPlayback({ currentTime: clampedTime });
        },
        []
    );

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
        const { duration } = state.timeline;
        const frameDuration = 1 / (frameRate || 24);
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
