// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { SceneManager } from './SceneManager';
import * as sceneStore from '../store/sceneStore';
import * as interpolate from '../animation/interpolate';
import { PrimitiveRenderer } from './renderers/PrimitiveRenderer';
import { LightRenderer } from './renderers/LightRenderer';
import { CameraRenderer } from './renderers/CameraRenderer';
import { CharacterRenderer } from './renderers/CharacterRenderer';

// Mock dependencies
vi.mock('../store/sceneStore', () => ({
  useSceneStore: vi.fn(),
}));

vi.mock('../animation/interpolate', () => ({
  evaluateTracksAtTime: vi.fn(),
}));

// Mock renderers to verify they are called with correct props
// We use a real functional component for the mock to capture props in the render output
vi.mock('./renderers/PrimitiveRenderer', () => ({
  PrimitiveRenderer: vi.fn((props) => <div data-testid="primitive-renderer" onClick={props.onClick} data-selected={props.isSelected} data-id={props.actor.id} />),
}));
vi.mock('./renderers/LightRenderer', () => ({
  LightRenderer: vi.fn((props) => <div data-testid="light-renderer" data-id={props.actor.id} />),
}));
vi.mock('./renderers/CameraRenderer', () => ({
  CameraRenderer: vi.fn((props) => <div data-testid="camera-renderer" data-active={props.isActive} data-id={props.actor.id} />),
}));
vi.mock('./renderers/CharacterRenderer', () => ({
  CharacterRenderer: vi.fn((props) => <div data-testid="character-renderer" onClick={props.onClick} data-selected={props.isSelected} data-id={props.actor.id} />),
}));

describe('SceneManager', () => {
  const mockActors = [
    { id: '1', type: 'primitive', name: 'Box', transform: { position: [0, 0, 0] } },
    { id: '2', type: 'light', name: 'Light', transform: { position: [10, 10, 10] } },
    { id: '3', type: 'camera', name: 'Cam', transform: { position: [0, 0, 5] } },
  ];

  const mockEnvironment = {
    ambientLight: { intensity: 0.5, color: '#ffffff' },
    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
    skyColor: '#87CEEB',
    fog: { color: '#cccccc', near: 10, far: 50 },
  };

  const mockTimeline = {
    animationTracks: [],
    cameraTrack: [],
  };

  const mockPlayback = {
    currentTime: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useSceneStore
    (sceneStore.useSceneStore as any).mockImplementation((selector: any) => {
      const state = {
        actors: mockActors,
        environment: mockEnvironment,
        timeline: mockTimeline,
        playback: mockPlayback,
      };
      return selector(state);
    });

    // Default mock for interpolate
    (interpolate.evaluateTracksAtTime as any).mockReturnValue(new Map());
  });

  afterEach(() => {
    cleanup();
  });

  it('should render environment lights and fog', () => {
    // Note: Since we are not inside a Canvas, these will render as HTML tags <ambientlight>, etc.
    // Testing Library can find them.
    const { container } = render(<SceneManager />);

    // Check if the elements exist in the container
    // We search by tag name because they are custom elements
    expect(container.getElementsByTagName('ambientlight').length).toBe(1);
    expect(container.getElementsByTagName('directionallight').length).toBe(1);
    expect(container.getElementsByTagName('fog').length).toBe(1);
  });

  it('should render actors using correct renderers', () => {
    const { getByTestId } = render(<SceneManager />);

    expect(getByTestId('primitive-renderer')).toBeDefined();
    expect(getByTestId('light-renderer')).toBeDefined();
    expect(getByTestId('camera-renderer')).toBeDefined();
  });

  it('should apply animation values to actors', () => {
    const animationMap = new Map();
    const actorAnimations = new Map();
    actorAnimations.set('transform.position', [1, 2, 3]);
    animationMap.set('1', actorAnimations);

    (interpolate.evaluateTracksAtTime as any).mockReturnValue(animationMap);

    render(<SceneManager />);

    // Verify PrimitiveRenderer received the updated actor
    // We check the mock calls
    const calls = (PrimitiveRenderer as any).mock.calls;
    // Find call for actor '1'
    const call = calls.find((c: any) => c[0].actor.id === '1');
    expect(call).toBeDefined();
    expect(call[0].actor.transform.position).toEqual([1, 2, 3]);
  });

  it('should handle camera cuts', () => {
    const cuts = [
      { time: 0, cameraId: '3' },
      { time: 5, cameraId: 'other' },
    ];

    // Update store mock for this test
    (sceneStore.useSceneStore as any).mockImplementation((selector: any) => {
        const state = {
            actors: mockActors,
            environment: mockEnvironment,
            timeline: { ...mockTimeline, cameraTrack: cuts },
            playback: { currentTime: 2 },
        };
        return selector(state);
    });

    const { getByTestId } = render(<SceneManager />);
    const cameraEl = getByTestId('camera-renderer');

    // Check data attribute we added in mock
    expect(cameraEl.getAttribute('data-active')).toBe('true');
  });

  it('should handle selection', () => {
    const { getByTestId } = render(<SceneManager selectedActorId="1" />);
    const primitiveEl = getByTestId('primitive-renderer');

    expect(primitiveEl.getAttribute('data-selected')).toBe('true');
  });

  it('should call onActorSelect when an actor is clicked', () => {
      const onSelect = vi.fn();
      const { getByTestId } = render(<SceneManager onActorSelect={onSelect} />);

      const primitiveEl = getByTestId('primitive-renderer');
      fireEvent.click(primitiveEl);

      expect(onSelect).toHaveBeenCalledWith('1');
  });
});
