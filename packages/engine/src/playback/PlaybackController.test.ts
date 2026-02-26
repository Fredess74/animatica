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
        // We can't easily assert raf called because hook uses refs/internal logic
        // But state update is key
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
    });

    it('should set speed', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.setSpeed(2.0);
        });
        expect(useSceneStore.getState().playback.speed).toBe(2.0);
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
});
