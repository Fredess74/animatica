import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore, getActorById, getActiveActors, getCurrentTime } from './sceneStore';
import { PrimitiveActor } from '../types';

describe('sceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState({
      actors: [],
      environment: {
        ambientLight: { intensity: 0.5, color: '#ffffff' },
        sun: { position: [5, 10, 5], intensity: 1.0, color: '#ffffff' },
        skyColor: '#87ceeb',
        fog: { color: '#87ceeb', near: 10, far: 50 },
        weather: { type: 'none', intensity: 0 },
      },
      timeline: {
        currentTime: 0,
        duration: 10,
        isPlaying: false,
        frameRate: 30,
        cameraTrack: [],
        animationTracks: [],
      },
    });
  });

  const mockActor: PrimitiveActor = {
    id: '1',
    name: 'Test Actor',
    type: 'primitive',
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true,
    properties: {
      shape: 'box',
      color: '#ffffff',
      roughness: 0.5,
      metalness: 0.5,
    },
  };

  it('should add an actor', () => {
    useSceneStore.getState().addActor(mockActor);
    expect(useSceneStore.getState().actors).toHaveLength(1);
    expect(useSceneStore.getState().actors[0]).toEqual(mockActor);
  });

  it('should remove an actor', () => {
    useSceneStore.getState().addActor(mockActor);
    useSceneStore.getState().removeActor('1');
    expect(useSceneStore.getState().actors).toHaveLength(0);
  });

  it('should update an actor', () => {
    useSceneStore.getState().addActor(mockActor);
    useSceneStore.getState().updateActor('1', { name: 'Updated Actor' });
    expect(useSceneStore.getState().actors[0].name).toBe('Updated Actor');
  });

  it('should set environment', () => {
    useSceneStore.getState().setEnvironment({ skyColor: '#0000ff' });
    expect(useSceneStore.getState().environment.skyColor).toBe('#0000ff');
  });

  it('should set timeline', () => {
    useSceneStore.getState().setTimeline({ currentTime: 5 });
    expect(useSceneStore.getState().timeline.currentTime).toBe(5);
  });

  it('should get actor by id selector', () => {
    useSceneStore.getState().addActor(mockActor);
    const result = getActorById('1')(useSceneStore.getState());
    expect(result).toEqual(mockActor);
  });

  it('should get active actors selector', () => {
    const activeActor = { ...mockActor, id: '1', visible: true };
    const inactiveActor = { ...mockActor, id: '2', visible: false };

    useSceneStore.getState().addActor(activeActor);
    useSceneStore.getState().addActor(inactiveActor);

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
