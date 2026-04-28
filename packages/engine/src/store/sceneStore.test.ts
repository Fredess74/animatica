/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
    useSceneStore,
    getActorById,
    getActiveActors,
    getCurrentTime,
    useActorById,
    useActorIds,
    useCurrentTime,
    useIsPlaying,
    useSelectedActorId,
    useSelectedActor,
    useActorsByType,
    useActorList,
    useActiveActors,
    useEnvironment,
    useTimeline,
    useCameraTrack,
    useAnimationTracks,
    usePlaybackState,
    useMeta,
    useSceneActions,
} from './sceneStore';
import { PrimitiveActor } from '../types';

describe('sceneStore', () => {
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
      playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
      meta: { title: 'Untitled Project', version: '1.0.0' },
      library: { clips: [] },
    });

    // Clear undo history
    if (useSceneStore.temporal) {
        useSceneStore.temporal.getState().clear();
    }
  });

  const createActor = (id: string, visible = true): PrimitiveActor => ({
    id,
    name: 'Test Actor',
    type: 'primitive',
    visible,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false },
  });

  it('should add an actor', () => {
    const actor = createActor('1');
    useSceneStore.getState().addActor(actor);
    expect(useSceneStore.getState().actors).toHaveLength(1);
    expect(useSceneStore.getState().actors[0]).toEqual(actor);
  });

  it('should remove an actor', () => {
    const actor = createActor('1');
    useSceneStore.getState().addActor(actor);
    useSceneStore.getState().removeActor('1');
    expect(useSceneStore.getState().actors).toHaveLength(0);
  });

  it('should update an actor', () => {
    const actor = createActor('1');
    useSceneStore.getState().addActor(actor);
    useSceneStore.getState().updateActor('1', { name: 'Updated Actor' });
    expect(useSceneStore.getState().actors[0].name).toBe('Updated Actor');
  });

  it('should set environment', () => {
    useSceneStore.getState().setEnvironment({ skyColor: '#000000' });
    expect(useSceneStore.getState().environment.skyColor).toBe('#000000');
  });

  it('should set timeline', () => {
    useSceneStore.getState().setTimeline({ duration: 20 });
    expect(useSceneStore.getState().timeline.duration).toBe(20);
  });

  it('should set playback', () => {
    useSceneStore.getState().setPlayback({ currentTime: 5 });
    expect(useSceneStore.getState().playback.currentTime).toBe(5);
  });

  it('should get actor by id selector', () => {
    const actor = createActor('1');
    useSceneStore.getState().addActor(actor);

    const result = getActorById('1')(useSceneStore.getState());
    expect(result).toEqual(actor);
  });

  it('should get active (visible) actors selector', () => {
    const actor1 = createActor('1', true);
    const actor2 = createActor('2', false);

    useSceneStore.getState().addActor(actor1);
    useSceneStore.getState().addActor(actor2);

    const result = getActiveActors(useSceneStore.getState());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should get current time selector', () => {
    useSceneStore.getState().setPlayback({ currentTime: 10 });
    const result = getCurrentTime(useSceneStore.getState());
    expect(result).toBe(10);
  });

  it('should set selected actor', () => {
    useSceneStore.getState().setSelectedActor('1');
    expect(useSceneStore.getState().selectedActorId).toBe('1');
  });

  it('should clear selection when actor is removed', () => {
      const actor = createActor('1');
      useSceneStore.getState().addActor(actor);
      useSceneStore.getState().setSelectedActor('1');

      useSceneStore.getState().removeActor('1');
      expect(useSceneStore.getState().selectedActorId).toBeNull();
  });

  it('should handle undo/redo', () => {
      const actor = createActor('1');
      useSceneStore.getState().addActor(actor);
      expect(useSceneStore.getState().actors).toHaveLength(1);

      // Undo
      useSceneStore.temporal.getState().undo();
      expect(useSceneStore.getState().actors).toHaveLength(0);

      // Redo
      useSceneStore.temporal.getState().redo();
      expect(useSceneStore.getState().actors).toHaveLength(1);
  });

  it('should not undo playback changes', () => {
      useSceneStore.getState().setPlayback({ currentTime: 0 });
      useSceneStore.getState().setPlayback({ currentTime: 10 });
      expect(useSceneStore.getState().playback.currentTime).toBe(10);

      const actor = createActor('1');
      useSceneStore.getState().addActor(actor);

      expect(useSceneStore.temporal.getState().pastStates.length).toBeGreaterThan(0);
      const pastStatesCount = useSceneStore.temporal.getState().pastStates.length;

      useSceneStore.getState().setPlayback({ currentTime: 20 });

      expect(useSceneStore.temporal.getState().pastStates.length).toBe(pastStatesCount);

      useSceneStore.temporal.getState().undo();

      expect(useSceneStore.getState().actors).toHaveLength(0);
      expect(useSceneStore.getState().playback.currentTime).toBe(20);
  });

  // Hook tests
  describe('hooks', () => {
    it('useActorById returns correct actor', () => {
        const actor = createActor('1');
        useSceneStore.getState().addActor(actor);
        const { result } = renderHook(() => useActorById('1'));
        expect(result.current).toEqual(actor);
    });

    it('useActorIds returns all IDs', () => {
        useSceneStore.getState().addActor(createActor('1'));
        useSceneStore.getState().addActor(createActor('2'));
        const { result } = renderHook(() => useActorIds());
        expect(result.current).toEqual(['1', '2']);
    });

    it('useCurrentTime returns playback time', () => {
        useSceneStore.getState().setPlayback({ currentTime: 42 });
        const { result } = renderHook(() => useCurrentTime());
        expect(result.current).toBe(42);
    });

    it('useIsPlaying returns playing status', () => {
        useSceneStore.getState().setPlayback({ isPlaying: true });
        const { result } = renderHook(() => useIsPlaying());
        expect(result.current).toBe(true);
    });

    it('useSelectedActorId returns selected ID', () => {
        useSceneStore.getState().setSelectedActor('123');
        const { result } = renderHook(() => useSelectedActorId());
        expect(result.current).toBe('123');
    });

    it('useSelectedActor returns actor object', () => {
        const actor = createActor('1');
        useSceneStore.getState().addActor(actor);
        useSceneStore.getState().setSelectedActor('1');
        const { result } = renderHook(() => useSelectedActor());
        expect(result.current).toEqual(actor);
    });

    it('useActorsByType filters correctly', () => {
        useSceneStore.getState().addActor(createActor('1'));
        const light: any = { id: '2', type: 'light', visible: true, transform: {}, properties: {} };
        useSceneStore.getState().addActor(light);
        const { result } = renderHook(() => useActorsByType('primitive'));
        expect(result.current).toHaveLength(1);
        expect(result.current[0].id).toBe('1');
    });

    it('useActiveActors returns only visible actors', () => {
        useSceneStore.getState().addActor(createActor('1', true));
        useSceneStore.getState().addActor(createActor('2', false));
        const { result } = renderHook(() => useActiveActors());
        expect(result.current).toHaveLength(1);
        expect(result.current[0].id).toBe('1');
    });

    it('useEnvironment returns environment state', () => {
        const { result } = renderHook(() => useEnvironment());
        expect(result.current.skyColor).toBe('#87CEEB');
    });

    it('useTimeline returns timeline state', () => {
        const { result } = renderHook(() => useTimeline());
        expect(result.current.duration).toBe(10);
    });

    it('useCameraTrack returns camera track', () => {
        const track = [{ time: 0, cameraId: 'c1' }];
        useSceneStore.getState().setTimeline({ cameraTrack: track });
        const { result } = renderHook(() => useCameraTrack());
        expect(result.current).toEqual(track);
    });

    it('useAnimationTracks returns animation tracks', () => {
        const tracks = [{ actorId: '1', properties: {} }];
        useSceneStore.getState().setTimeline({ animationTracks: tracks as any });
        const { result } = renderHook(() => useAnimationTracks());
        expect(result.current).toEqual(tracks);
    });

    it('usePlaybackState returns full playback object', () => {
        const { result } = renderHook(() => usePlaybackState());
        expect(result.current.currentTime).toBe(0);
        expect(result.current.isPlaying).toBe(false);
    });

    it('useMeta returns project meta', () => {
        const { result } = renderHook(() => useMeta());
        expect(result.current.title).toBe('Untitled Project');
    });

    it('useSceneActions returns all action dispatchers', () => {
        const { result } = renderHook(() => useSceneActions());
        expect(typeof result.current.addActor).toBe('function');
        expect(typeof result.current.setPlayback).toBe('function');
    });
  });
});
