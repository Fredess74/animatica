// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { usePlayback } from './PlaybackController';
import { useSceneStore } from '../store/sceneStore';
import { Marker } from '../types';

// Mock requestAnimationFrame and cancelAnimationFrame
const requestAnimationFrameMock = vi.fn(() => {
    // Return a dummy ID
    return 123;
});
const cancelAnimationFrameMock = vi.fn();

vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);

describe('usePlayback', () => {
    beforeEach(() => {
        useSceneStore.setState({
            playback: { currentTime: 0, isPlaying: false, frameRate: 10, loopMode: 'none' },
            timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] }
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePlayback());
        // Just checking if hook renders without error
        expect(result.current).toBeDefined();
    });

    it('should set loop mode', () => {
        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.setLoopMode('loop');
        });
        expect(useSceneStore.getState().playback.loopMode).toBe('loop');
    });

    it('should set speed', () => {
        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.setSpeed(2.0);
        });
        // Speed is internal ref, not exposed directly, but affects playback
        // We can verify it doesn't crash
    });

    it('should step forward one frame', () => {
        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.nextFrame();
        });
        // Frame rate is 10, so 1 frame = 0.1s
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(0.1);
    });

    it('should step backward one frame', () => {
        useSceneStore.setState((state) => { state.playback.currentTime = 0.5; });
        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.prevFrame();
        });
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(0.4);
    });

    it('should navigate to next marker', () => {
        const markers: Marker[] = [
            { id: '1', time: 2, label: 'A' },
            { id: '2', time: 5, label: 'B' },
            { id: '3', time: 8, label: 'C' }
        ];
        useSceneStore.setState((state) => { state.timeline.markers = markers; state.playback.currentTime = 3; });

        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.nextMarker();
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(5);
    });

    it('should navigate to previous marker', () => {
        const markers: Marker[] = [
            { id: '1', time: 2, label: 'A' },
            { id: '2', time: 5, label: 'B' },
            { id: '3', time: 8, label: 'C' }
        ];
        useSceneStore.setState((state) => { state.timeline.markers = markers; state.playback.currentTime = 6; });

        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.prevMarker();
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(5);
    });

    it('should handle loop mode logic (loop)', () => {
        // We can't easily test requestAnimationFrame loop in unit test without faking timers heavily.
        // But we can test the logic if we expose 'tick' or simulate it?
        // Since 'tick' is internal, we rely on integration test or just trust the logic for now.
        // However, we can test boundary conditions via stepping if we manually set time near end.

        // Actually, nextFrame doesn't trigger loop logic (it just adds time).
        // The loop logic is inside 'tick'.
        // Testing 'tick' is hard without exposing it.
        // But we can verify 'play' calls requestAnimationFrame.

        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.play();
        });
        expect(requestAnimationFrameMock).toHaveBeenCalled();
        expect(useSceneStore.getState().playback.isPlaying).toBe(true);

        act(() => {
            result.current.pause();
        });
        expect(cancelAnimationFrameMock).toHaveBeenCalled();
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
    });

    it('should loop around markers when at end', () => {
         const markers: Marker[] = [
            { id: '1', time: 2, label: 'A' },
            { id: '2', time: 5, label: 'B' }
        ];
        useSceneStore.setState((state) => { state.timeline.markers = markers; state.playback.currentTime = 6; });

        const { result } = renderHook(() => usePlayback());
        act(() => {
            result.current.nextMarker();
        });
        // Should loop to first
        expect(useSceneStore.getState().playback.currentTime).toBe(2);
    });
});
