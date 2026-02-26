/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useEffect, useRef, useCallback } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { type LoopMode } from '../types';

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
    const lastTimeRef = useRef<number>(0);

    const isPlaying = useSceneStore((s) => s.playback.isPlaying);

    const tick = useCallback((timestamp: number) => {
        if (!lastTimeRef.current) {
            lastTimeRef.current = timestamp;
        }
        const delta = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;

        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const { currentTime, speed, direction, loopMode } = state.playback;

        if (!state.playback.isPlaying) return;

        let nextTime = currentTime + delta * speed * direction;

        if (direction === 1 && nextTime >= duration) {
            if (loopMode === 'loop') {
                nextTime = nextTime % duration;
            } else if (loopMode === 'bounce') {
                nextTime = duration - (nextTime - duration);
                state.setPlayback({ direction: -1 });
            } else {
                nextTime = duration;
                state.setPlayback({ isPlaying: false });
            }
        } else if (direction === -1 && nextTime <= 0) {
             if (loopMode === 'loop') {
                nextTime = duration + nextTime;
            } else if (loopMode === 'bounce') {
                nextTime = -nextTime;
                state.setPlayback({ direction: 1 });
            } else {
                nextTime = 0;
                state.setPlayback({ isPlaying: false });
            }
        }

        state.setPlayback({ currentTime: nextTime });
        rafIdRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = performance.now();
            rafIdRef.current = requestAnimationFrame(tick);
        } else {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [isPlaying, tick]);

    const play = useCallback(() => {
        const state = useSceneStore.getState();
        if (state.playback.currentTime >= state.timeline.duration && state.playback.direction === 1) {
             state.setPlayback({ currentTime: 0, isPlaying: true });
        } else {
             state.setPlayback({ isPlaying: true });
        }
    }, []);

    const pause = useCallback(() => {
        useSceneStore.getState().setPlayback({ isPlaying: false });
    }, []);

    const stop = useCallback(() => {
        useSceneStore.getState().setPlayback({ isPlaying: false, currentTime: 0, direction: 1 });
    }, []);

    const seek = useCallback((time: number) => {
        useSceneStore.getState().setPlayback({ currentTime: time });
    }, []);

    const toggle = useCallback(() => {
        const state = useSceneStore.getState();
        if (state.playback.isPlaying) {
            state.setPlayback({ isPlaying: false });
        } else {
             if (state.playback.currentTime >= state.timeline.duration && state.playback.direction === 1) {
                 state.setPlayback({ currentTime: 0, isPlaying: true });
            } else {
                 state.setPlayback({ isPlaying: true });
            }
        }
    }, []);

    const setSpeed = useCallback((speed: number) => {
        useSceneStore.getState().setPlayback({ speed });
    }, []);

    const setLoopMode = useCallback((mode: LoopMode) => {
        useSceneStore.getState().setPlayback({ loopMode: mode });
    }, []);

    const nextFrame = useCallback(() => {
        const state = useSceneStore.getState();
        const fps = state.playback.frameRate || 24;
        const dt = 1 / fps;
        state.setPlayback({ currentTime: Math.min(state.timeline.duration, state.playback.currentTime + dt), isPlaying: false });
    }, []);

    const prevFrame = useCallback(() => {
        const state = useSceneStore.getState();
        const fps = state.playback.frameRate || 24;
        const dt = 1 / fps;
        state.setPlayback({ currentTime: Math.max(0, state.playback.currentTime - dt), isPlaying: false });
    }, []);

    return { play, pause, stop, seek, toggle, setSpeed, setLoopMode, nextFrame, prevFrame };
}
