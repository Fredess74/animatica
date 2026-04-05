/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useActorActions, useEnvironmentActions, useTimelineActions, usePlaybackActions, useMetaActions, useEnvironmentState, useTimelineState, usePlaybackState, useMetaState } from './sceneStore';

describe('SceneStore Optimized Hooks', () => {
  it('useActorActions should return actor action functions', () => {
    const { result } = renderHook(() => useActorActions());
    expect(result.current.addActor).toBeTypeOf('function');
    expect(result.current.removeActor).toBeTypeOf('function');
    expect(result.current.updateActor).toBeTypeOf('function');
    expect(result.current.setSelectedActor).toBeTypeOf('function');
  });

  it('useEnvironmentActions should return setEnvironment function', () => {
    const { result } = renderHook(() => useEnvironmentActions());
    expect(result.current).toBeTypeOf('function');
  });

  it('useTimelineActions should return setTimeline function', () => {
    const { result } = renderHook(() => useTimelineActions());
    expect(result.current).toBeTypeOf('function');
  });

  it('usePlaybackActions should return setPlayback function', () => {
    const { result } = renderHook(() => usePlaybackActions());
    expect(result.current).toBeTypeOf('function');
  });

  it('useMetaActions should return setMeta function', () => {
    const { result } = renderHook(() => useMetaActions());
    expect(result.current).toBeTypeOf('function');
  });

  it('useEnvironmentState should return environment state', () => {
    const { result } = renderHook(() => useEnvironmentState());
    expect(result.current).toHaveProperty('ambientLight');
    expect(result.current).toHaveProperty('sun');
    expect(result.current).toHaveProperty('skyColor');
  });

  it('useTimelineState should return timeline state', () => {
    const { result } = renderHook(() => useTimelineState());
    expect(result.current).toHaveProperty('duration');
    expect(result.current).toHaveProperty('animationTracks');
  });

  it('usePlaybackState should return playback state', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current).toHaveProperty('currentTime');
    expect(result.current).toHaveProperty('isPlaying');
  });

  it('useMetaState should return meta state', () => {
    const { result } = renderHook(() => useMetaState());
    expect(result.current).toHaveProperty('title');
    expect(result.current).toHaveProperty('version');
  });
});
