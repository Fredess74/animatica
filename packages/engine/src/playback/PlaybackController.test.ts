// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePlayback } from './PlaybackController';
import { useSceneStore } from '../store/sceneStore';

// Mock requestAnimationFrame and cancelAnimationFrame
const requestAnimationFrameMock = vi.fn();
const cancelAnimationFrameMock = vi.fn();

global.requestAnimationFrame = requestAnimationFrameMock;
global.cancelAnimationFrame = cancelAnimationFrameMock;

describe('usePlayback', () => {
  beforeEach(() => {
    // Reset store state
    useSceneStore.setState({
      playback: { currentTime: 0, isPlaying: false, frameRate: 24 },
      timeline: { duration: 10, cameraTrack: [], animationTracks: [] }
    });
    vi.clearAllMocks();
  });

  it('should return playback controls', () => {
    const { result } = renderHook(() => usePlayback());
    expect(result.current).toHaveProperty('play');
    expect(result.current).toHaveProperty('pause');
    expect(result.current).toHaveProperty('stop');
    expect(result.current).toHaveProperty('seek');
    expect(result.current).toHaveProperty('toggle');
    expect(result.current).toHaveProperty('setSpeed');
  });

  it('should start playback when play is called', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => {
      result.current.play();
    });

    const state = useSceneStore.getState();
    expect(state.playback.isPlaying).toBe(true);
    expect(requestAnimationFrameMock).toHaveBeenCalled();
  });

  it('should pause playback when pause is called', () => {
    const { result } = renderHook(() => usePlayback());

    // First start playing
    act(() => {
      result.current.play();
    });

    // We expect play to have requested a frame
    const rafId = requestAnimationFrameMock.mock.results[0].value;

    act(() => {
      result.current.pause();
    });

    const state = useSceneStore.getState();
    expect(state.playback.isPlaying).toBe(false);
    expect(cancelAnimationFrameMock).toHaveBeenCalled();
  });

  it('should stop playback and reset time when stop is called', () => {
    const { result } = renderHook(() => usePlayback());

    // Set some time and play state
    useSceneStore.setState({ playback: { currentTime: 5, isPlaying: true, frameRate: 24 } });

    act(() => {
        // Ensure rafIdRef is populated by calling play
        result.current.play();
    });

    act(() => {
      result.current.stop();
    });

    const state = useSceneStore.getState();
    expect(state.playback.isPlaying).toBe(false);
    expect(state.playback.currentTime).toBe(0);
    expect(cancelAnimationFrameMock).toHaveBeenCalled();
  });

  it('should seek to specific time', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => {
      result.current.seek(5);
    });

    const state = useSceneStore.getState();
    expect(state.playback.currentTime).toBe(5);
  });

  it('should clamp seek time to duration', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => {
      result.current.seek(15); // Duration is 10
    });

    let state = useSceneStore.getState();
    expect(state.playback.currentTime).toBe(10);

    act(() => {
      result.current.seek(-5);
    });

    state = useSceneStore.getState();
    expect(state.playback.currentTime).toBe(0);
  });

  it('should toggle playback state', () => {
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

  it('should advance time correctly in loop', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => {
        result.current.play();
    });

    // Extract the tick function from the RAF mock call
    const tick = requestAnimationFrameMock.mock.calls[0][0];

    // Simulate first frame (sets lastFrameTimeRef)
    act(() => {
        tick(1000);
    });

    // Simulate second frame (100ms later)
    act(() => {
        // The first tick call should have scheduled the next tick
        const nextTick = requestAnimationFrameMock.mock.calls[1][0];
        nextTick(1100);
    });

    const state = useSceneStore.getState();
    // 100ms = 0.1s
    // Default speed is 1.0
    // Expected time: 0 + 0.1 = 0.1
    // The store uses quantization based on frameRate (24fps -> ~0.0416s per frame)
    // 0.1s is approx 2.4 frames.
    // round(0.1 / (1/24)) * (1/24) = round(2.4) * 0.04166 = 2 * 0.04166 = 0.08333

    expect(state.playback.currentTime).toBeCloseTo(0.0833, 3);
  });

  it('should handle speed multiplier', () => {
    const { result } = renderHook(() => usePlayback({ speed: 2.0 }));

    act(() => {
        result.current.play();
    });

    const tick = requestAnimationFrameMock.mock.calls[0][0];

    // First frame
    act(() => {
        tick(1000);
    });

    // Second frame (100ms later)
    act(() => {
        const nextTick = requestAnimationFrameMock.mock.calls[1][0];
        nextTick(1100);
    });

    const state = useSceneStore.getState();
    // delta = 0.1s
    // speed = 2.0
    // deltaSec = 0.2s
    // frameDuration = 1/24 = 0.041666...
    // newTime = 0.2
    // newTime / frameDuration = 4.8
    // round(4.8) = 5
    // quantizedTime = 5 * 0.041666... = 0.208333...

    expect(state.playback.currentTime).toBeCloseTo(0.2083, 3);
  });

  it('should update speed dynamically', () => {
    const { result } = renderHook(() => usePlayback());

    act(() => {
        result.current.setSpeed(2.0);
        result.current.play();
    });

    const tick = requestAnimationFrameMock.mock.calls[0][0];
    act(() => tick(1000));

    const nextTick = requestAnimationFrameMock.mock.calls[1][0];
    act(() => nextTick(1100)); // 100ms delta

    const state = useSceneStore.getState();
    // Same calculation as above: 0.1s * 2.0 = 0.2s -> quantized to ~0.2083
    expect(state.playback.currentTime).toBeCloseTo(0.2083, 3);
  });

  it('should loop playback when loop is true', () => {
    const { result } = renderHook(() => usePlayback({ loop: true }));

    // Set time near end
    useSceneStore.setState({ playback: { currentTime: 9.9, isPlaying: true, frameRate: 24 } });

    act(() => {
        result.current.play();
    });

    const tick = requestAnimationFrameMock.mock.calls[0][0];

    // First frame
    act(() => tick(1000));

    // Second frame (200ms later) -> should cross 10s mark
    // 9.9 + 0.2 = 10.1
    // 10.1 % 10 = 0.1
    // Note: The first tick quantizes 9.9 to frame 238 (9.9166...), so actual start is 9.9166...
    // 9.9166... + 0.2 = 10.1166...
    // 10.1166... % 10 = 0.1166...
    // 0.1166... / (1/24) = 2.8 -> rounds to 3
    // Frame 3 is 3/24 = 0.125
    const nextTick = requestAnimationFrameMock.mock.calls[1][0];
    act(() => nextTick(1200));

    const state = useSceneStore.getState();
    expect(state.playback.currentTime).toBeCloseTo(0.125, 3);
    expect(state.playback.isPlaying).toBe(true);
  });

  it('should stop playback at end when loop is false', () => {
    const { result } = renderHook(() => usePlayback({ loop: false }));

    useSceneStore.setState({ playback: { currentTime: 9.9, isPlaying: true, frameRate: 24 } });

    act(() => {
        result.current.play();
    });

    const tick = requestAnimationFrameMock.mock.calls[0][0];
    act(() => tick(1000));

    // Second frame (200ms later) -> 10.1
    // Should stop at 10
    const nextTick = requestAnimationFrameMock.mock.calls[1][0];
    act(() => nextTick(1200));

    const state = useSceneStore.getState();
    expect(state.playback.currentTime).toBe(10);
    expect(state.playback.isPlaying).toBe(false);
  });

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => usePlayback());

    act(() => {
        result.current.play();
    });

    unmount();

    expect(cancelAnimationFrameMock).toHaveBeenCalled();
  });
});
