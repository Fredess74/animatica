// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { usePlayback } from './PlaybackController';
import * as sceneStore from '../store/sceneStore';

// Mock dependencies
vi.mock('../store/sceneStore', () => {
    const fn: any = vi.fn();
    fn.getState = vi.fn();
    return { useSceneStore: fn };
});

describe('usePlayback', () => {
    let mockSetPlayback: any;
    let mockState: any;
    let now = 0;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        now = 0;

        mockState = {
            playback: {
                currentTime: 0,
                isPlaying: false,
                frameRate: 60, // Set to 60 to match our update loop better
            },
            timeline: {
                duration: 10,
            },
            setPlayback: null,
        };

        mockSetPlayback = vi.fn((updates) => {
             if (updates) {
                 Object.assign(mockState.playback, updates);
             }
        });
        mockState.setPlayback = mockSetPlayback;

        (sceneStore.useSceneStore as any).mockImplementation((selector: any) => {
            return selector(mockState);
        });

        (sceneStore.useSceneStore as any).getState.mockReturnValue(mockState);

        // Mock requestAnimationFrame to simulate time passing
        // Use 20ms to ensure we are slightly above 1/60s (16.66ms) to avoid rounding down issues
        vi.stubGlobal('requestAnimationFrame', (fn: any) => {
            return setTimeout(() => {
                now += 20;
                fn(now);
            }, 20);
        });

        vi.stubGlobal('cancelAnimationFrame', (id: any) => {
            clearTimeout(id);
        });
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => usePlayback());

        expect(result.current.play).toBeDefined();
        expect(result.current.pause).toBeDefined();
        expect(result.current.stop).toBeDefined();
        expect(result.current.seek).toBeDefined();
        expect(result.current.toggle).toBeDefined();
        expect(result.current.setSpeed).toBeDefined();
    });

    it('play() should start playback', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        expect(mockSetPlayback).toHaveBeenCalledWith({ isPlaying: true });
        expect(mockState.playback.isPlaying).toBe(true);
    });

    it('pause() should stop playback', () => {
        mockState.playback.isPlaying = true;

        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.pause();
        });

        expect(mockSetPlayback).toHaveBeenCalledWith({ isPlaying: false });
        expect(mockState.playback.isPlaying).toBe(false);
    });

    it('stop() should reset to zero', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.stop();
        });

        expect(mockSetPlayback).toHaveBeenCalledWith({ currentTime: 0, isPlaying: false });
    });

    it('seek() should update time', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.seek(5);
        });

        expect(mockSetPlayback).toHaveBeenCalledWith({ currentTime: 5 });
    });

    it('seek() should clamp time', () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.seek(15);
        });

        expect(mockSetPlayback).toHaveBeenCalledWith({ currentTime: 10 });

        act(() => {
            result.current.seek(-5);
        });

        expect(mockSetPlayback).toHaveBeenCalledWith({ currentTime: 0 });
    });

    it('tick execution should advance time', async () => {
        const { result } = renderHook(() => usePlayback());

        act(() => {
            result.current.play();
        });

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const calls = mockSetPlayback.mock.calls;
        const timeUpdate = calls.find((call: any) => call[0].currentTime !== undefined && call[0].currentTime > 0);
        expect(timeUpdate).toBeDefined();
    });

    it('should loop when loop option is true', async () => {
        mockState.playback.currentTime = 9.9;

        const { result } = renderHook(() => usePlayback({ loop: true }));

        act(() => {
            result.current.play();
        });

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        const calls = mockSetPlayback.mock.calls;
        const resetCall = calls.find((call: any) => call[0].currentTime !== undefined && call[0].currentTime < 2.0);
        expect(resetCall).toBeDefined();
    });

    it('should stop at end when loop option is false', async () => {
        mockState.playback.currentTime = 9.9;

        const { result } = renderHook(() => usePlayback({ loop: false }));

        act(() => {
            result.current.play();
        });

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        const calls = mockSetPlayback.mock.calls;
        const stopCall = calls.find((call: any) => call[0].isPlaying === false);
        expect(stopCall).toBeDefined();

        const endCall = calls.find((call: any) => call[0].currentTime === 10);
        expect(endCall).toBeDefined();
    });
});
