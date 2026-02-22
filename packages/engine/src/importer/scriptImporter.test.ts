import { describe, it, expect } from 'vitest';
import { importScript, importScriptFromString } from './scriptImporter.js';
import type { ProjectState } from '../types/index.js';

const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';
const validUUID3 = '123e4567-e89b-12d3-a456-426614174002';

const validProject: ProjectState = {
  meta: {
    title: 'Test Project',
    version: '1.0.0',
    description: 'A test project',
    author: 'Tester',
  },
  environment: {
    ambientLight: { intensity: 0.5, color: '#ffffff' },
    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffcc' },
    skyColor: '#87ceeb',
    weather: { type: 'rain', intensity: 0.5 },
  },
  actors: [
    {
      id: validUUID1,
      name: 'Hero',
      type: 'character',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      visible: true,
      animation: 'idle',
      morphTargets: {},
      bodyPose: {},
      clothing: {},
    },
    {
      id: validUUID2,
      name: 'Main Camera',
      type: 'camera',
      transform: {
        position: [0, 2, 5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      visible: true,
      properties: {
        fov: 75,
        near: 0.1,
        far: 1000,
      },
    },
  ],
  timeline: {
    duration: 10,
    cameraTrack: [
      {
        id: validUUID3,
        time: 0,
        cameraId: validUUID2,
        transition: 'cut',
        transitionDuration: 0,
      },
    ],
    animationTracks: [
      {
        targetId: validUUID1,
        property: 'transform.position',
        keyframes: [
          { time: 0, value: [0, 0, 0] },
          { time: 5, value: [5, 0, 0], easing: 'linear' },
        ],
      },
    ],
  },
  library: {
    clips: [],
  },
};

describe('scriptImporter', () => {
  it('should validate a correct project state object', () => {
    const result = importScript(validProject);
    if (!result.success) {
      console.error(JSON.stringify(result.errors, null, 2));
    }
    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual(validProject);
  });

  it('should validate a correct project state string', () => {
    const jsonString = JSON.stringify(validProject);
    const result = importScriptFromString(jsonString);
    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual(validProject);
  });

  it('should fail on invalid JSON string', () => {
    const result = importScriptFromString('{ invalid json }');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('JSON Parse Error');
  });

  it('should fail when required fields are missing', () => {
    const invalidProject = { ...validProject } as any;
    const invalid = { ...validProject };
    delete (invalid as any).meta;

    const result = importScript(invalid);
    expect(result.success).toBe(false);
    // Check if error message contains 'meta' and some indication of missing/invalid input
    expect(result.errors.some((e) => e.includes('meta'))).toBe(true);
  });

  it('should fail on invalid data types', () => {
    const invalidProject = JSON.parse(JSON.stringify(validProject));
    invalidProject.environment.ambientLight.intensity = 'high'; // Should be number

    const result = importScript(invalidProject);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes('environment.ambientLight.intensity'))).toBe(true);
  });

  it('should fail on invalid enum values', () => {
    const invalidProject = JSON.parse(JSON.stringify(validProject));
    invalidProject.actors[0].type = 'monster'; // Invalid type

    const result = importScript(invalidProject);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
