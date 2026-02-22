import { describe, it, expect } from 'vitest';
import {
  ActorSchema,
  ProjectStateSchema,
  Vector3Schema,
  ColorSchema,
} from './index';

describe('Zod Schemas', () => {
  it('validates a correct Vector3', () => {
    const data = [1, 2, 3];
    expect(Vector3Schema.parse(data)).toEqual([1, 2, 3]);
  });

  it('rejects an incorrect Vector3', () => {
    const data = [1, 2];
    expect(() => Vector3Schema.parse(data)).toThrow();
  });

  it('validates a correct Color', () => {
    const data = '#ff0000';
    expect(ColorSchema.parse(data)).toBe('#ff0000');
  });

  it('rejects an incorrect Color', () => {
    expect(() => ColorSchema.parse('#zzz')).toThrow();
    expect(() => ColorSchema.parse('red')).toThrow();
  });

  it('validates a CharacterActor', () => {
    const actor = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Hero',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      visible: true,
      type: 'character',
      animation: 'idle',
      morphTargets: {},
      bodyPose: {},
      clothing: {},
    };
    expect(ActorSchema.parse(actor)).toEqual(actor);
  });

  it('validates a PrimitiveActor', () => {
    const actor = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Box',
      transform: {
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      visible: true,
      type: 'primitive',
      properties: {
        shape: 'box',
        color: '#00ff00',
        roughness: 0.5,
        metalness: 0.1,
      },
    };
    expect(ActorSchema.parse(actor)).toEqual(actor);
  });

  it('validates a full ProjectState', () => {
    const project = {
      meta: {
        title: 'My Movie',
        version: '1.0.0',
      },
      environment: {
        ambientLight: { intensity: 0.5, color: '#ffffff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#ffff00' },
        skyColor: '#87ceeb',
      },
      actors: [],
      timeline: {
        duration: 10,
        cameraTrack: [],
        animationTracks: [],
      },
      library: { clips: [] },
    };
    expect(ProjectStateSchema.parse(project)).toEqual(project);
  });
});
