// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayback } from './PlaybackController';
import { useSceneStore } from '../store/sceneStore';

// Mock requestAnimationFrame
const raf = vi.fn();
const caf = vi.fn();
global.requestAnimationFrame = raf;
global.cancelAnimationFrame = caf;

describe('usePlayback', () => {
    beforeEach(() => {
        useSceneStore.setState({
            playback: {
                currentTime: 0,
                isPlaying: false,
                frameRate: 24,
                speed: 1.0,
                direction: 1,
                loopMode: 'none',
            },
            timeline: {
                duration: 10,
                cameraTrack: [],
                animationTracks: [],
                markers: [],
            },
        });
        raf.mockReset();
        caf.mockReset();
        // Mock implementation to return an ID
        raf.mockReturnValue(123);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with default state', () => {
        renderHook(() => usePlayback());
        const state = useSceneStore.getState().playback;
        expect(state.isPlaying).toBe(false);
        expect(state.currentTime).toBe(0);
        expect(state.speed).toBe(1.0);
    });

    it('should start playing when play is called', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        const state = useSceneStore.getState().playback;
        expect(state.isPlaying).toBe(true);
        expect(raf).toHaveBeenCalled();
    });

    it('should pause playback', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });
        expect(useSceneStore.getState().playback.isPlaying).toBe(true);

        act(() => {
            result.current.pause();
        });
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
    });

    it('should stop playback and reset time', () => {
        const { result } = renderHook(() => usePlayback());
        useSceneStore.setState((s) => { s.playback.currentTime = 5; });

        act(() => {
            result.current.stop();
        });

        const state = useSceneStore.getState().playback;
        expect(state.isPlaying).toBe(false);
        expect(state.currentTime).toBe(0);
        expect(state.direction).toBe(1);
    });

    it('should seek to a specific time', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.seek(5);
        });

        expect(useSceneStore.getState().playback.currentTime).toBe(5);

        // Test clamping
        act(() => {
            result.current.seek(15); // Duration is 10
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(10);

        act(() => {
            result.current.seek(-1);
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(0);
    });

    it('should set speed', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.setSpeed(2.0);
        });
        expect(useSceneStore.getState().playback.speed).toBe(2.0);

        act(() => {
            result.current.setSpeed(0); // Should clamp to 0.1
        });
        expect(useSceneStore.getState().playback.speed).toBe(0.1);
    });

    it('should toggle play/pause', () => {
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

    it('should step next frame', () => {
        const { result } = renderHook(() => usePlayback());
        // Frame rate 24, so 1/24 ~= 0.041666...

        act(() => {
            result.current.nextFrame();
        });

        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(1/24, 4);
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
    });

    it('should step previous frame', () => {
        const { result } = renderHook(() => usePlayback());
        useSceneStore.setState((s) => { s.playback.currentTime = 1.0; });

        act(() => {
            result.current.prevFrame();
        });

        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(1.0 - 1/24, 4);
    });

    it('should advance time when playing', () => {
        let rafCallback: FrameRequestCallback | null = null;
        raf.mockImplementation((cb) => {
            rafCallback = cb;
            return 123;
        });

        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        expect(rafCallback).not.toBeNull();

        // Initial tick setup (sets lastFrameTimeRef)
        act(() => {
            if (rafCallback) rafCallback(1000);
        });

        // Advance time
        act(() => {
            if (rafCallback) rafCallback(1100); // +100ms
        });

        // Default speed 1.0. Delta 0.1s.
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(0.1);
    });

    it('should handle loop mode "loop"', () => {
        let rafCallback: FrameRequestCallback | null = null;
        raf.mockImplementation((cb) => {
            rafCallback = cb;
            return 123;
        });

        useSceneStore.setState((s) => {
            s.playback.loopMode = 'loop';
            s.playback.currentTime = 9.9;
        });

        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        // Initial tick setup
        act(() => {
            if (rafCallback) rafCallback(1000);
        });

        // Advance +0.2s (crosses 10.0)
        act(() => {
            if (rafCallback) rafCallback(1200);
        });

        // 9.9 + 0.2 = 10.1. 10.1 % 10 = 0.1
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(0.1);
    });

    it('should handle loop mode "pingpong"', () => {
        let rafCallback: FrameRequestCallback | null = null;
        raf.mockImplementation((cb) => {
            rafCallback = cb;
            return 123;
        });

        useSceneStore.setState((s) => {
            s.playback.loopMode = 'pingpong';
            s.playback.currentTime = 9.9;
            s.playback.direction = 1;
        });

        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        // Initial tick setup
        act(() => {
            if (rafCallback) rafCallback(1000);
        });

        // Advance +0.2s (crosses 10.0)
        act(() => {
            if (rafCallback) rafCallback(1200);
        });

        // Should hit end and reverse
        const state = useSceneStore.getState().playback;
        expect(state.direction).toBe(-1);
        expect(state.currentTime).toBe(10);

        // Next tick (backwards)
        act(() => {
            if (rafCallback) rafCallback(1300); // +0.1s
        });

        // 10 - 0.1 = 9.9
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(9.9);
    });
});
