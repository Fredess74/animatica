/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSceneStore,
  useSceneActions,
  useActorList,
  useEnvironment,
  useTimeline,
  useAnimationTracks,
  useCameraTrack,
  useCurrentTime,
} from './sceneStore';

describe('sceneStore hooks', () => {
  beforeEach(() => {
    useSceneStore.setState({
      actors: [],
      selectedActorId: null,
      timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
      environment: {
        ambientLight: { intensity: 0.5, color: '#ffffff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
        skyColor: '#87CEEB',
      },
      playback: {
        currentTime: 0,
        isPlaying: false,
        frameRate: 24,
        speed: 1.0,
        direction: 1,
        loopMode: 'none',
      },
    });
  });

  it('useSceneActions should return stable references to actions', () => {
    const { result, rerender } = renderHook(() => useSceneActions());
    const initialActions = result.current;

    act(() => {
      useSceneStore.setState({ selectedActorId: 'some-id' });
    });

    rerender();
    expect(result.current.addActor).toBe(initialActions.addActor);
    expect(result.current.setEnvironment).toBe(initialActions.setEnvironment);
  });

  it('useActorList should select the actors array', () => {
    const { result } = renderHook(() => useActorList());
    expect(result.current).toEqual([]);

    const testActor: any = { id: '1', name: 'Test' };
    act(() => {
      useSceneStore.getState().addActor(testActor);
    });

    expect(result.current).toEqual([testActor]);
  });

  it('useEnvironment should select environment settings', () => {
    const { result } = renderHook(() => useEnvironment());
    expect(result.current.skyColor).toBe('#87CEEB');

    act(() => {
      useSceneStore.getState().setEnvironment({ skyColor: '#000000' });
    });

    expect(result.current.skyColor).toBe('#000000');
  });

  it('useTimeline should select timeline configuration', () => {
    const { result } = renderHook(() => useTimeline());
    expect(result.current.duration).toBe(10);

    act(() => {
      useSceneStore.getState().setTimeline({ duration: 20 });
    });

    expect(result.current.duration).toBe(20);
  });

  it('useAnimationTracks should select animation tracks', () => {
    const { result } = renderHook(() => useAnimationTracks());
    expect(result.current).toEqual([]);

    const tracks: any[] = [{ actorId: '1', properties: [] }];
    act(() => {
      useSceneStore.getState().setTimeline({ animationTracks: tracks });
    });

    expect(result.current).toEqual(tracks);
  });

  it('useCameraTrack should select camera track', () => {
    const { result } = renderHook(() => useCameraTrack());
    expect(result.current).toEqual([]);

    const cameraTrack: any[] = [{ time: 0, cameraId: 'cam1' }];
    act(() => {
      useSceneStore.getState().setTimeline({ cameraTrack });
    });

    expect(result.current).toEqual(cameraTrack);
  });

  it('useCurrentTime should select current playback time', () => {
    const { result } = renderHook(() => useCurrentTime());
    expect(result.current).toBe(0);

    act(() => {
      useSceneStore.getState().setPlayback({ currentTime: 5.5 });
    });

    expect(result.current).toBe(5.5);
  });
});
