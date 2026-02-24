// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    useSceneStore,
    getActorById,
    getActiveActors,
    getCurrentTime,
    useActorById,
    useActorsByType,
    useUndoRedo
} from './sceneStore';
import { PrimitiveActor } from '../types';

describe('sceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState({
      actors: [],
      selectedActorId: null,
      timeline: { duration: 10, cameraTrack: [], animationTracks: [] },
      environment: {
          ambientLight: { intensity: 0.5, color: '#ffffff' },
          sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
          skyColor: '#87CEEB',
      },
      playback: { currentTime: 0, isPlaying: false, frameRate: 24 },
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

  // New Tests

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

  it('should handle undo/redo via hook', () => {
      const { result } = renderHook(() => useUndoRedo());
      const actor = createActor('1');

      act(() => {
          useSceneStore.getState().addActor(actor);
      });

      expect(result.current.canUndo).toBe(true);

      act(() => {
          result.current.undo();
      });
      expect(useSceneStore.getState().actors).toHaveLength(0);
      expect(result.current.canRedo).toBe(true);

      act(() => {
          result.current.redo();
      });
      expect(useSceneStore.getState().actors).toHaveLength(1);
  });

  it('should not undo playback changes', () => {
      // Set initial playback
      useSceneStore.getState().setPlayback({ currentTime: 0 });

      // Change playback
      useSceneStore.getState().setPlayback({ currentTime: 10 });
      expect(useSceneStore.getState().playback.currentTime).toBe(10);

      const actor = createActor('1');
      useSceneStore.getState().addActor(actor); // Tracked change

      // Verify history tracked the actor addition
      expect(useSceneStore.temporal.getState().pastStates.length).toBeGreaterThan(0);
      const pastStatesCount = useSceneStore.temporal.getState().pastStates.length;

      useSceneStore.getState().setPlayback({ currentTime: 20 }); // Untracked change

      // Verify history didn't grow
      expect(useSceneStore.temporal.getState().pastStates.length).toBe(pastStatesCount);

      useSceneStore.temporal.getState().undo(); // Should undo addActor

      expect(useSceneStore.getState().actors).toHaveLength(0);
      expect(useSceneStore.getState().playback.currentTime).toBe(20); // Should remain 20
  });

  it('should maintain referential equality of selectors during playback updates', () => {
      const actor = createActor('1');
      act(() => {
          useSceneStore.getState().addActor(actor);
      });

      const { result: byIdResult } = renderHook(() => useActorById('1'));
      const { result: byTypeResult } = renderHook(() => useActorsByType('primitive'));

      const initialActorRef = byIdResult.current;
      const initialListRef = byTypeResult.current;

      expect(initialActorRef).toBeDefined();
      expect(initialListRef).toHaveLength(1);

      // Trigger playback update (should be transient for these selectors)
      act(() => {
          useSceneStore.getState().setPlayback({ currentTime: 1.5 });
      });

      // Verify references are exactly the same
      expect(byIdResult.current).toBe(initialActorRef);
      expect(byTypeResult.current).toBe(initialListRef);

      // Verify update still works for actual changes
      act(() => {
        useSceneStore.getState().updateActor('1', { name: 'Changed' });
      });

      expect(byIdResult.current).not.toBe(initialActorRef); // Should be new ref
      expect(byIdResult.current?.name).toBe('Changed');
      expect(byTypeResult.current).not.toBe(initialListRef); // Should be new array ref (because one item changed)
  });
});
