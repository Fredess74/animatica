import { describe, it, expect, beforeEach } from 'vitest';
import { useEngineStore } from './useEngineStore';
import { ProjectState, Actor, Keyframe } from '../types';

const initialState = {
  meta: { title: 'Untitled Project', version: '1.0.0' },
  environment: {
    ambientLight: { intensity: 0.5, color: '#ffffff' },
    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
    skyColor: '#87CEEB',
  },
  actors: [],
  timeline: {
    duration: 10,
    cameraTrack: [],
    animationTracks: [],
  },
  library: { clips: [] },
  playback: { currentTime: 0, isPlaying: false, frameRate: 30 },
};

describe('useEngineStore', () => {
  beforeEach(() => {
    useEngineStore.setState(JSON.parse(JSON.stringify(initialState)));
  });

  it('should add an actor', () => {
    const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false },
    };
    useEngineStore.getState().addActor(actor);
    expect(useEngineStore.getState().actors).toHaveLength(1);
    expect(useEngineStore.getState().actors[0]).toEqual(actor);
  });

  it('should remove an actor', () => {
    const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false },
    };
    useEngineStore.getState().addActor(actor);
    useEngineStore.getState().removeActor('1');
    expect(useEngineStore.getState().actors).toHaveLength(0);
  });

  it('should update an actor', () => {
    const actor: Actor = {
      id: '1',
      name: 'Test Actor',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false },
    };
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

  it('should add keyframe', () => {
    const keyframe: Keyframe = { time: 1, value: 10, easing: 'linear' };
    useEngineStore.getState().addKeyframe('actor-1', 'position.x', keyframe);

    const track = useEngineStore.getState().timeline.animationTracks.find(t => t.targetId === 'actor-1' && t.property === 'position.x');
    expect(track).toBeDefined();
    expect(track?.keyframes).toHaveLength(1);
    expect(track?.keyframes[0]).toEqual(keyframe);
  });

  it('should manage playback', () => {
    useEngineStore.getState().play();
    expect(useEngineStore.getState().playback.isPlaying).toBe(true);

    useEngineStore.getState().pause();
    expect(useEngineStore.getState().playback.isPlaying).toBe(false);

    useEngineStore.getState().seek(5);
    expect(useEngineStore.getState().playback.currentTime).toBe(5);
  });

  it('should load project', () => {
    const project: ProjectState = {
      meta: { title: 'Loaded Project', version: '1.0.0' },
      environment: {
        ambientLight: { intensity: 0.8, color: '#ffff00' },
        sun: { position: [0, 10, 0], intensity: 0.5, color: '#ff0000' },
        skyColor: '#0000ff',
      },
      actors: [],
      timeline: { duration: 60, cameraTrack: [], animationTracks: [] },
      library: { clips: [] },
    };

    useEngineStore.getState().loadProject(project);

    expect(useEngineStore.getState().meta.title).toBe('Loaded Project');
    expect(useEngineStore.getState().environment.skyColor).toBe('#0000ff');
    expect(useEngineStore.getState().timeline.duration).toBe(60);
    expect(useEngineStore.getState().playback.currentTime).toBe(0); // Should be reset
  });
});
