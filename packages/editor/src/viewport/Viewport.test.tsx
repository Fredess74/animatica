import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Viewport } from './Viewport';

// Mock dependencies
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useThree: () => ({ camera: { position: [0,0,0] }, scene: {} }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="grid" />,
  GizmoHelper: ({ children }: any) => <div data-testid="gizmo-helper">{children}</div>,
  GizmoViewport: () => <div data-testid="gizmo-viewport" />,
  TransformControls: ({ children }: any) => <div data-testid="transform-controls">{children}</div>,
}));

vi.mock('@Animatica/engine', () => ({
  SceneManager: ({ selectedActorId }: any) => <div data-testid="scene-manager" data-selected={selectedActorId || ''} />,
  useSceneStore: (selector: any) => {
    // Mock store state
    const state = {
      actors: [
        { id: '1', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] } }
      ],
      updateActor: vi.fn(),
    };

    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
  getActorById: (id: string) => (state: any) => state.actors.find((a: any) => a.id === id),
}));

// Mock EditorControls
vi.mock('./EditorControls', () => ({
  EditorControls: ({ selectedActorId }: any) => selectedActorId ? <div data-testid="editor-controls" data-selected={selectedActorId} /> : null,
}));

describe('Viewport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canvas and children', () => {
    const { getByTestId } = render(<Viewport />);
    expect(getByTestId('canvas')).toBeDefined();
    expect(getByTestId('orbit-controls')).toBeDefined();
    expect(getByTestId('grid')).toBeDefined();
    expect(getByTestId('scene-manager')).toBeDefined();
    expect(getByTestId('gizmo-helper')).toBeDefined();
  });

  it('passes selectedActorId to SceneManager', () => {
    const { getByTestId } = render(<Viewport selectedActorId="1" />);
    const sceneManager = getByTestId('scene-manager');
    expect(sceneManager.getAttribute('data-selected')).toBe('1');
  });

  it('renders EditorControls when actor is selected', () => {
     const { getByTestId } = render(<Viewport selectedActorId="1" />);
     expect(getByTestId('editor-controls')).toBeDefined();
  });

  it('does not render EditorControls when no actor is selected', () => {
     const { queryByTestId } = render(<Viewport selectedActorId={null} />);
     expect(queryByTestId('editor-controls')).toBeNull();
  });
});
