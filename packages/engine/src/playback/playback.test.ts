// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { usePlayback } from './PlaybackController';
import { useSceneStore } from '../store/sceneStore';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('usePlayback', () => {
    let frameCallback: FrameRequestCallback | null = null;
    let cancelAnimationFrameSpy: any;

    beforeEach(() => {
        useSceneStore.setState({
            playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1, loopMode: 'none' },
            timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
        });

        frameCallback = null;
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            frameCallback = cb;
            return 1; // Mock ID
        });
        cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('plays and pauses', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });
        expect(useSceneStore.getState().playback.isPlaying).toBe(true);
        expect(frameCallback).toBeTruthy();

        act(() => {
            result.current.pause();
        });
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
        expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });

    it('advances time correctly with default speed', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        // Initial frame to set lastFrameTime
        act(() => {
            if (frameCallback) frameCallback(1000);
        });

        // Advance 1 second
        act(() => {
            if (frameCallback) frameCallback(2000);
        });

        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(1);
    });

    it('respects speed control', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.setSpeed(2);
            result.current.play();
        });

        act(() => {
            if (frameCallback) frameCallback(1000);
        });

        act(() => {
            if (frameCallback) frameCallback(2000); // 1s delta
        });

        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(2); // 1s * 2x speed
    });

    it('stops at end when loopMode is none', () => {
        useSceneStore.setState((s) => { s.timeline.duration = 5; s.playback.currentTime = 4.5; });
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        act(() => {
            if (frameCallback) frameCallback(1000);
        });

        act(() => {
            if (frameCallback) frameCallback(2000); // +1s -> 5.5s
        });

        expect(useSceneStore.getState().playback.currentTime).toBe(5);
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);
    });

    it('loops when loopMode is loop', () => {
        useSceneStore.setState((s) => {
            s.timeline.duration = 5;
            s.playback.currentTime = 4.5;
            s.playback.loopMode = 'loop';
        });
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        act(() => {
            if (frameCallback) frameCallback(1000);
        });

        act(() => {
            if (frameCallback) frameCallback(2000); // +1s -> 5.5s -> 0.5s
        });

        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(0.5);
        expect(useSceneStore.getState().playback.isPlaying).toBe(true);
    });

    it('pingpongs when loopMode is pingpong', () => {
        useSceneStore.setState((s) => {
            s.timeline.duration = 5;
            s.playback.currentTime = 4.5;
            s.playback.loopMode = 'pingpong';
        });
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        act(() => {
            if (frameCallback) frameCallback(1000);
        });

        // 1s delta -> 5.5s. Should hit 5 and reverse.
        // Implementation detail: tick sets currentTime to duration and reverses direction.
        // Next tick will go backwards.

        // Trigger tick that hits end
        act(() => {
            if (frameCallback) frameCallback(2000);
        });

        expect(useSceneStore.getState().playback.currentTime).toBe(5);
        // Expect direction to be reversed internaly.
        // Next tick: +1s delta. newTime = 5 + (1 * -1) = 4.

        act(() => {
            if (frameCallback) frameCallback(3000);
        });

        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(4);
    });

    it('steps forward and backward', () => {
        const { result } = renderHook(() => usePlayback());
        const frameTime = 1 / 24;

        act(() => {
            result.current.stepForward();
        });
        expect(useSceneStore.getState().playback.currentTime).toBeCloseTo(frameTime);
        expect(useSceneStore.getState().playback.isPlaying).toBe(false);

        act(() => {
            result.current.stepBackward();
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(0);
    });

    it('seeks to markers', () => {
        useSceneStore.setState((s) => {
            s.timeline.markers = [
                { id: '1', time: 2, label: 'M1', color: '#000' },
                { id: '2', time: 5, label: 'M2', color: '#000' }
            ];
            s.playback.currentTime = 1;
        });

        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.seekToNextMarker();
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(2);

        act(() => {
            result.current.seekToNextMarker();
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(5);

        act(() => {
            result.current.seekToPrevMarker();
        });
        expect(useSceneStore.getState().playback.currentTime).toBe(2);
    });
});
