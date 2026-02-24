/**
 * PlaybackController — Provides controls for animation playback.
 * This hook manages the playback state in the store.
 * The actual animation loop is driven by the PlaybackSystem component.
 *
 * @module @animatica/engine/playback/PlaybackController
 */
import { useCallback, useEffect } from 'react';
import { useSceneStore } from '../store/sceneStore';

/**
 * Options for customizing playback behavior.
 */
interface PlaybackOptions {
    /** Whether to loop the animation when it reaches the end. */
    loop?: boolean;
    /** Playback speed multiplier (1.0 = normal). */
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
 * Note: This hook does NOT run the animation loop. Ensure <PlaybackSystem /> is mounted in the scene.
 *
 * @param options Optional playback configuration to initialize the store.
 * @returns PlaybackControls object.
 */
export function usePlayback(options: PlaybackOptions = {}): PlaybackControls {
    const { loop, speed } = options;
    const setPlayback = useSceneStore((s) => s.setPlayback);

    // Initialize store with options if provided
    useEffect(() => {
        const updates: any = {};
        if (loop !== undefined) updates.loop = loop;
        if (speed !== undefined) updates.speed = speed;

        if (Object.keys(updates).length > 0) {
            setPlayback(updates);
        }
    }, [loop, speed, setPlayback]);

    /**
     * Starts playback.
     */
    const play = useCallback(() => {
        const state = useSceneStore.getState();
        const { duration } = state.timeline;
        const { currentTime } = state.playback;

        // If at the end, reset to start
        if (currentTime >= duration) {
            setPlayback({ currentTime: 0, isPlaying: true });
        } else {
            setPlayback({ isPlaying: true });
        }
    }, [setPlayback]);

    /**
     * Pauses playback.
     */
    const pause = useCallback(() => {
        setPlayback({ isPlaying: false });
    }, [setPlayback]);

    /**
     * Stops playback and resets to time 0.
     */
    const stop = useCallback(() => {
        setPlayback({ currentTime: 0, isPlaying: false });
    }, [setPlayback]);

    /**
     * Seeks to a specific time in seconds.
     */
    const seek = useCallback(
        (time: number) => {
            const state = useSceneStore.getState();
            const { duration } = state.timeline;
            const clampedTime = Math.max(0, Math.min(time, duration));
            setPlayback({ currentTime: clampedTime });
        },
        [setPlayback]
    );

    /**
     * Toggles between play and pause.
     */
    const toggle = useCallback(() => {
        const isPlaying = useSceneStore.getState().playback.isPlaying;
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [play, pause]);

    /**
     * Sets the playback speed multiplier.
     */
    const setSpeedHandler = useCallback((newSpeed: number) => {
        const clampedSpeed = Math.max(0.1, Math.min(newSpeed, 10));
        setPlayback({ speed: clampedSpeed });
    }, [setPlayback]);

    return {
        play,
        pause,
        stop,
        seek,
        toggle,
        setSpeed: setSpeedHandler
    };
}
