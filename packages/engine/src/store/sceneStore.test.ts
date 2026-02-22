import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore, getActiveActors } from './sceneStore';
import { PrimitiveActor } from '../types';

describe('sceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState({
      actors: [],
    });
    useSceneStore.getState().actors = [];
  });

  const testActor: PrimitiveActor = {
    id: '1',
    name: 'Test Actor',
    type: 'primitive',
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true,
    properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5 }
  };

  it('should add an actor', () => {
    useSceneStore.setState({ actors: [] });
    useSceneStore.getState().addActor(testActor);
    expect(useSceneStore.getState().actors).toHaveLength(1);
    expect(useSceneStore.getState().actors[0]).toEqual(testActor);
  });

  it('should remove an actor', () => {
    useSceneStore.setState({ actors: [] });
    useSceneStore.getState().addActor(testActor);
    useSceneStore.getState().removeActor('1');
    expect(useSceneStore.getState().actors).toHaveLength(0);
  });

  it('should update an actor', () => {
    useSceneStore.setState({ actors: [] });
    useSceneStore.getState().addActor(testActor);
    useSceneStore.getState().updateActor('1', { name: 'Updated Actor' });
    expect(useSceneStore.getState().actors[0].name).toBe('Updated Actor');
  });

  it('should set environment', () => {
    useSceneStore.getState().setEnvironment({ skyColor: '#000000' });
    expect(useSceneStore.getState().environment.skyColor).toBe('#000000');
  });

  it('should set playback', () => {
    useSceneStore.getState().setPlayback({ currentTime: 5 });
    expect(useSceneStore.getState().playback.currentTime).toBe(5);
  });

  it('should get active actors selector', () => {
    useSceneStore.setState({ actors: [] });
    const activeActor = { ...testActor, id: '1', visible: true };
    const inactiveActor = { ...testActor, id: '2', visible: false };

    useSceneStore.getState().addActor(activeActor);
    useSceneStore.getState().addActor(inactiveActor);

    const result = getActiveActors(useSceneStore.getState());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
