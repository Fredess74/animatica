/**
 * PlaybackController — Drives animation playback via requestAnimationFrame.
 * Provides a React hook that manages the animation loop, time tracking,
 * and camera cuts for the scene.
 *
 * @module @Animatica/engine/playback/PlaybackController
 */
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
 * @returns PlaybackControls object.
 */
export function usePlayback(): PlaybackControls {
    const rafIdRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const isPlaying = useSceneStore((s) => s.playback.isPlaying);

    /**
     * The core animation frame callback.
     * Calculates delta time and advances the store's currentTime.
     */
    const tick = useCallback((timestamp: number) => {
        if (lastFrameTimeRef.current === null) lastFrameTimeRef.current = timestamp;
        const deltaMs = timestamp - lastFrameTimeRef.current;
        lastFrameTimeRef.current = timestamp;

        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const { currentTime, speed, direction, loopMode } = state.playback;

        // Calculate new time based on delta, speed and direction
        let newTime = currentTime + (deltaMs / 1000) * speed * direction;

        // Handle boundaries and loop modes
        if (direction === 1 && newTime >= duration) {
            if (loopMode === 'loop') newTime %= duration;
            else if (loopMode === 'pingpong') {
                newTime = duration;
                state.setPlayback({ direction: -1, currentTime: newTime });
            } else {
                state.setPlayback({ currentTime: duration, isPlaying: false });
                return;
            }
        } else if (direction === -1 && newTime <= 0) {
            if (loopMode === 'loop') newTime = duration;
            else if (loopMode === 'pingpong') {
                newTime = 0;
                state.setPlayback({ direction: 1, currentTime: newTime });
            } else {
                state.setPlayback({ currentTime: 0, isPlaying: false });
                return;
            }
        }

        // Only update store if the change is significant to avoid unnecessary re-renders
        if (Math.abs(newTime - currentTime) > 0.00001) {
            state.setPlayback({ currentTime: newTime });
        }

        rafIdRef.current = requestAnimationFrame(tick);
    }, []);

    // Effect to start/stop the animation loop based on isPlaying state
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
            if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
        };
    }, [isPlaying, tick]);

    /** Starts the animation loop. */
    const play = useCallback(() => {
        const { timeline: { duration }, playback: { currentTime, direction }, setPlayback } = useSceneStore.getState();
        if (direction === 1 && currentTime >= duration) setPlayback({ currentTime: 0, isPlaying: true });
        else if (direction === -1 && currentTime <= 0) setPlayback({ currentTime: duration, isPlaying: true });
        else setPlayback({ isPlaying: true });
    }, []);

    /** Pauses the animation loop. */
    const pause = useCallback(() => useSceneStore.getState().setPlayback({ isPlaying: false }), []);

    /** Stops playback and resets to time 0. */
    const stop = useCallback(() => useSceneStore.getState().setPlayback({ currentTime: 0, isPlaying: false, direction: 1 }), []);

    /** Seeks to a specific time. */
    const seek = useCallback((time: number) => {
        const { timeline: { duration }, setPlayback } = useSceneStore.getState();
        setPlayback({ currentTime: Math.max(0, Math.min(time, duration)) });
    }, []);

    /** Toggles between play and pause. */
    const toggle = useCallback(() => {
        const { isPlaying: playing } = useSceneStore.getState().playback;
        playing ? pause() : play();
    }, [play, pause]);

    /** Set playback speed (clamped between 0.1 and 10). */
    const setSpeed = useCallback((s: number) => useSceneStore.getState().setPlayback({ speed: Math.max(0.1, Math.min(s, 10)) }), []);

    /** Set the current loop mode. */
    const setLoopMode = useCallback((m: LoopMode) => useSceneStore.getState().setPlayback({ loopMode: m }), []);

    /** Generic step function for frame-by-frame navigation. */
    const step = useCallback((dir: 1 | -1) => {
        const { playback: { frameRate, currentTime }, timeline: { duration }, setPlayback } = useSceneStore.getState();
        const frameDur = 1 / (frameRate || 24);
        const newTime = Math.max(0, Math.min(duration, currentTime + dir * frameDur));
        setPlayback({ currentTime: newTime, isPlaying: false });
    }, []);

    const nextFrame = useCallback(() => step(1), [step]);
    const prevFrame = useCallback(() => step(-1), [step]);

    return { play, pause, stop, seek, toggle, setSpeed, setLoopMode, nextFrame, prevFrame };
}
