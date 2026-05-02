/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSceneStore, useEnvironment, useTimeline, usePlaybackState, useMeta, useSceneActions } from './sceneStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('sceneStore hooks', () => {
  beforeEach(() => {
    useSceneStore.setState({
      actors: [],
      selectedActorId: null,
      environment: {
        ambientLight: { intensity: 0.5, color: '#ffffff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
        skyColor: '#87CEEB',
      },
      timeline: {
        duration: 10,
        cameraTrack: [],
        animationTracks: [],
        markers: [],
      },
      playback: {
        currentTime: 0,
        isPlaying: false,
        frameRate: 24,
        speed: 1.0,
        direction: 1,
        loopMode: 'none',
      },
      meta: {
        title: 'Untitled Project',
        version: '1.0.0',
      },
      library: { clips: [] },
    });
  });

  it('should return environment state', () => {
    const { result } = renderHook(() => useEnvironment());
    expect(result.current.skyColor).toBe('#87CEEB');
  });

  it('should return timeline state', () => {
    const { result } = renderHook(() => useTimeline());
    expect(result.current.duration).toBe(10);
  });

  it('should return playback state', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('should return meta state', () => {
    const { result } = renderHook(() => useMeta());
    expect(result.current.title).toBe('Untitled Project');
  });

  it('should provide stable actions', () => {
    const { result, rerender } = renderHook(() => useSceneActions());
    const initialActions = result.current;

    expect(typeof initialActions.addActor).toBe('function');
    expect(typeof initialActions.updateActor).toBe('function');
    expect(typeof initialActions.setEnvironment).toBe('function');

    // Update state to trigger rerender
    useSceneStore.setState({ meta: { title: 'New Title', version: '1.0.0' } });
    rerender();

    expect(result.current.addActor).toBe(initialActions.addActor);
    expect(result.current.setEnvironment).toBe(initialActions.setEnvironment);
  });
});
