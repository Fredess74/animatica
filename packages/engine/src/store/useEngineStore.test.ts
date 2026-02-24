import { describe, it, expect, beforeEach } from 'vitest';
import { useEngineStore, getActorById, getActiveActors, getCurrentTime } from './useEngineStore';
import { PrimitiveActor } from '../types';

describe('useEngineStore', () => {
  beforeEach(() => {
    useEngineStore.setState({
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
    if (useEngineStore.temporal) {
        useEngineStore.temporal.getState().clear();
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
    useEngineStore.getState().addActor(actor);
    expect(useEngineStore.getState().actors).toHaveLength(1);
    expect(useEngineStore.getState().actors[0]).toEqual(actor);
  });

  it('should remove an actor', () => {
    const actor = createActor('1');
    useEngineStore.getState().addActor(actor);
    useEngineStore.getState().removeActor('1');
    expect(useEngineStore.getState().actors).toHaveLength(0);
  });

  it('should update an actor', () => {
    const actor = createActor('1');
    useEngineStore.getState().addActor(actor);
    useEngineStore.getState().updateActor('1', { name: 'Updated Actor' });
    expect(useEngineStore.getState().actors[0].name).toBe('Updated Actor');
  });

  it('should set environment', () => {
    useEngineStore.getState().setEnvironment({ skyColor: '#000000' });
    expect(useEngineStore.getState().environment.skyColor).toBe('#000000');
  });

  it('should set timeline', () => {
    useEngineStore.getState().setTimeline({ duration: 20 });
    expect(useEngineStore.getState().timeline.duration).toBe(20);
  });

  it('should set playback', () => {
    useEngineStore.getState().setPlayback({ currentTime: 5 });
    expect(useEngineStore.getState().playback.currentTime).toBe(5);
  });

  it('should get actor by id selector', () => {
    const actor = createActor('1');
    useEngineStore.getState().addActor(actor);

    const result = getActorById('1')(useEngineStore.getState());
    expect(result).toEqual(actor);
  });

  it('should get active (visible) actors selector', () => {
    const actor1 = createActor('1', true);
    const actor2 = createActor('2', false);

    useEngineStore.getState().addActor(actor1);
    useEngineStore.getState().addActor(actor2);

    const result = getActiveActors(useEngineStore.getState());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should get current time selector', () => {
    useEngineStore.getState().setPlayback({ currentTime: 10 });
    const result = getCurrentTime(useEngineStore.getState());
    expect(result).toBe(10);
  });

  // New Tests

  it('should set selected actor', () => {
    useEngineStore.getState().setSelectedActor('1');
    expect(useEngineStore.getState().selectedActorId).toBe('1');
  });

  it('should clear selection when actor is removed', () => {
      const actor = createActor('1');
      useEngineStore.getState().addActor(actor);
      useEngineStore.getState().setSelectedActor('1');

      useEngineStore.getState().removeActor('1');
      expect(useEngineStore.getState().selectedActorId).toBeNull();
  });

  it('should handle undo/redo', () => {
      const actor = createActor('1');
      useEngineStore.getState().addActor(actor);
      expect(useEngineStore.getState().actors).toHaveLength(1);

      // Undo
      useEngineStore.temporal.getState().undo();
      expect(useEngineStore.getState().actors).toHaveLength(0);

      // Redo
      useEngineStore.temporal.getState().redo();
      expect(useEngineStore.getState().actors).toHaveLength(1);
  });

  it('should not undo playback changes', () => {
      // Set initial playback
      useEngineStore.getState().setPlayback({ currentTime: 0 });

      // Change playback
      useEngineStore.getState().setPlayback({ currentTime: 10 });
      expect(useEngineStore.getState().playback.currentTime).toBe(10);

      const actor = createActor('1');
      useEngineStore.getState().addActor(actor); // Tracked change

      // Verify history tracked the actor addition
      expect(useEngineStore.temporal.getState().pastStates.length).toBeGreaterThan(0);
      const pastStatesCount = useEngineStore.temporal.getState().pastStates.length;

      useEngineStore.getState().setPlayback({ currentTime: 20 }); // Untracked change

      // Verify history didn't grow
      expect(useEngineStore.temporal.getState().pastStates.length).toBe(pastStatesCount);

      useEngineStore.temporal.getState().undo(); // Should undo addActor

      expect(useEngineStore.getState().actors).toHaveLength(0);
      expect(useEngineStore.getState().playback.currentTime).toBe(20); // Should remain 20
  });

  it('should filter actors by type', () => {
      const primitive = createActor('1');
      const light: any = { id: '2', type: 'light', visible: true, transform: primitive.transform, properties: { lightType: 'point' } };

      useEngineStore.getState().addActor(primitive);
      useEngineStore.getState().addActor(light);

      // Simulate useActorsByType logic
      const result = useEngineStore.getState().actors.filter(a => a.type === 'primitive');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
  });
});
