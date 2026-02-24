// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { usePlayback } from './PlaybackController';
import { useSceneStore } from '../store/sceneStore';

// Manual Mock for requestAnimationFrame
let rafIdCounter = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();
let currentTime = 0;

const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const id = ++rafIdCounter;
    rafCallbacks.set(id, callback);
    return id;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
    rafCallbacks.delete(id);
});

// Helper to advance frames
const advanceTime = (ms: number) => {
    // Simulate 60fps frame loop
    const step = 1000 / 60; // 16.666... ms
    let remaining = ms;

    while (remaining > 0) {
        const dt = Math.min(remaining, step);
        currentTime += dt;
        remaining -= dt;

        // Run all currently scheduled callbacks
        const callbacksToRun = Array.from(rafCallbacks.entries());
        rafCallbacks.clear(); // Clear immediately, as rAF is one-shot

        callbacksToRun.forEach(([id, cb]) => {
            cb(currentTime);
        });
    }
};

// Helper to reset store
const resetStore = () => {
    useSceneStore.setState((state) => {
        state.actors = [];
        // Set frameRate to 60 to match our simulation step (16.6ms), ensuring quantization works correctly
        // With frameRate 24 (41ms), 16ms steps would round down to 0 and time wouldn't advance
        state.playback = { currentTime: 0, isPlaying: false, frameRate: 60 };
        state.timeline = { duration: 10, cameraTrack: [], animationTracks: [] };
        state.environment = {
            ambientLight: { intensity: 0.5, color: '#ffffff' },
            sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
            skyColor: '#87CEEB',
        };
        state.selectedActorId = null;
    });
};

describe('usePlayback', () => {
    beforeEach(() => {
        resetStore();
        rafIdCounter = 0;
        rafCallbacks.clear();
        currentTime = 1000; // Start at non-zero to avoid potential falsy checks issues

        vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame);
        vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns playback controls', () => {
        const { result } = renderHook(() => usePlayback());
        expect(result.current).toHaveProperty('play');
        expect(result.current).toHaveProperty('pause');
        expect(result.current).toHaveProperty('stop');
        expect(result.current).toHaveProperty('seek');
        expect(result.current).toHaveProperty('toggle');
        expect(result.current).toHaveProperty('setSpeed');
    });

    it('starts playback when play is called', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        const state = useSceneStore.getState();
        expect(state.playback.isPlaying).toBe(true);
        expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('advances time during playback', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        // First frame initializes lastFrameTimeRef, delta=0
        act(() => {
            advanceTime(16.666);
        });

        // Second frame has delta
        act(() => {
            advanceTime(1000);
        });

        const state = useSceneStore.getState();
        expect(state.playback.currentTime).toBeGreaterThan(0);
        expect(state.playback.currentTime).toBeCloseTo(1.0, 1);
    });

    it('pauses playback when pause is called', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
            advanceTime(16.666); // Init
            advanceTime(500); // Run
        });

        const timeAtPause = useSceneStore.getState().playback.currentTime;
        expect(timeAtPause).toBeGreaterThan(0);

        act(() => {
            result.current.pause();
        });

        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
        expect(mockCancelAnimationFrame).toHaveBeenCalled();

        act(() => {
            advanceTime(1000);
        });

        // Time should not change
        expect(useSceneStore.getState().playback.currentTime).toBe(timeAtPause);
    });

    it('stops playback and resets time when stop is called', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
            advanceTime(16.666);
            advanceTime(500);
            result.current.stop();
        });

        const state = useSceneStore.getState();
        expect(state.playback.isPlaying).toBe(false);
        expect(state.playback.currentTime).toBe(0);
    });

    it('seeks to specific time', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.seek(5);
        });

        expect(useSceneStore.getState().playback.currentTime).toBe(5);
    });

    it('clamps seek time to duration', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.seek(-5);
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(0);

        act(() => {
            result.current.seek(100); // Duration is 10
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(10);
    });

    it('toggles playback state', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.toggle();
        });
        expect(useSceneStore.getState().playback.isPlaying).toBe(true);

        act(() => {
            result.current.toggle();
        });
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
    });

    it('adjusts playback speed', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.setSpeed(2.0);
            result.current.play();
            advanceTime(16.666); // Init
            advanceTime(1000);
        });

        // Should advance ~2 seconds in 1 second real time
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(2.0, 1);
    });

    it('stops at end of timeline if loop is false', () => {
        const { result } = renderHook(() => usePlayback({ loop: false }));

        act(() => {
            // Start near end
            useSceneStore.setState(state => { state.playback.currentTime = 9.5; });
            result.current.play();
            advanceTime(16.666); // Init (delta 0)
            advanceTime(1000); // 1s -> 10.5 -> clamp 10 -> stop
        });

        const state = useSceneStore.getState();
        expect(state.playback.isPlaying).toBe(false);
        expect(state.playback.currentTime).toBe(10);
    });

    it('loops playback if loop is true', () => {
        const { result } = renderHook(() => usePlayback({ loop: true }));

        act(() => {
            // Start near end
            useSceneStore.setState(state => { state.playback.currentTime = 9.5; });
            result.current.play();
            advanceTime(16.666); // Init
            advanceTime(1000); // 1s -> 10.5 -> wrapped to 0.5
        });

        const state = useSceneStore.getState();
        expect(state.playback.isPlaying).toBe(true);
        // Time should be around 0.5
        expect(state.playback.currentTime).toBeCloseTo(0.5, 1);
    });
});
