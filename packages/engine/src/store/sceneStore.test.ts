import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore, getActorById, getActiveActors, getCurrentTime } from './sceneStore';
import { Actor } from '../types';

describe('sceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState({
      actors: [],
      environment: { id: 'default-env', name: 'Default Environment' },
      timeline: { currentTime: 0, duration: 10, isPlaying: false, frameRate: 24 },
    });
  });

  it('should add an actor', () => {
    const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'mesh',
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      isActive: true,
    };

    useSceneStore.getState().addActor(actor);
    expect(useSceneStore.getState().actors).toHaveLength(1);
    expect(useSceneStore.getState().actors[0]).toEqual(actor);
  });

  it('should remove an actor', () => {
    const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'mesh',
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      isActive: true,
    };

    useSceneStore.getState().addActor(actor);
    useSceneStore.getState().removeActor('1');
    expect(useSceneStore.getState().actors).toHaveLength(0);
  });

  it('should update an actor', () => {
    const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'mesh',
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      isActive: true,
    };

    useSceneStore.getState().addActor(actor);
    useSceneStore.getState().updateActor('1', { name: 'Updated Actor' });
    expect(useSceneStore.getState().actors[0].name).toBe('Updated Actor');
  });

  it('should set environment', () => {
    useSceneStore.getState().setEnvironment({ name: 'New Environment' });
    expect(useSceneStore.getState().environment.name).toBe('New Environment');
  });

  it('should set timeline', () => {
    useSceneStore.getState().setTimeline({ currentTime: 5 });
    expect(useSceneStore.getState().timeline.currentTime).toBe(5);
  });

  it('should get actor by id selector', () => {
     const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'mesh',
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      isActive: true,
    };
    useSceneStore.getState().addActor(actor);

    const result = getActorById('1')(useSceneStore.getState());
    expect(result).toEqual(actor);
  });

  it('should get active actors selector', () => {
     const actor1: Actor = {
      id: '1',
      name: 'Active Actor',
      type: 'mesh',
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      isActive: true,
    };
     const actor2: Actor = {
      id: '2',
      name: 'Inactive Actor',
      type: 'mesh',
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      isActive: false,
    };
    useSceneStore.getState().addActor(actor1);
    useSceneStore.getState().addActor(actor2);

    const result = getActiveActors(useSceneStore.getState());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should get current time selector', () => {
    useSceneStore.getState().setTimeline({ currentTime: 10 });
    const result = getCurrentTime(useSceneStore.getState());
    expect(result).toBe(10);
  });
});
