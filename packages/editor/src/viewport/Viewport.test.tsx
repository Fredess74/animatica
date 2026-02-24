// @vitest-environment jsdom
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Viewport } from './Viewport';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock Canvas to avoid WebGL context issues in JSDOM
vi.mock('@react-three/fiber', async () => {
  const original = await vi.importActual('@react-three/fiber');
  return {
    ...original,
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas-mock">{children}</div>,
    useThree: () => ({
      camera: {
        position: { set: vi.fn() },
        rotation: { set: vi.fn() },
        lookAt: vi.fn(),
      },
      gl: { domElement: document.createElement('div') },
    }),
  };
});

// Mock drei components
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  TransformControls: () => null,
  Grid: () => null,
}));

// Mock Engine components
vi.mock('@Animatica/engine', async () => {
  const original = await vi.importActual('@Animatica/engine');
  return {
    ...original,
    SceneManager: () => null,
    // Keep useSceneStore real or mock it if needed.
    // Using real store should be fine as it uses zustand/immer which works in node/jsdom.
  };
});

describe('Viewport', () => {
  it('renders without crashing', () => {
    render(<Viewport />);
    expect(screen.getByTestId('canvas-mock')).toBeTruthy();
  });

  it('renders toolbar buttons', () => {
    render(<Viewport />);
    expect(screen.getByRole('button', { name: 'Translate (W)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Rotate (E)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Scale (R)' })).toBeTruthy();

    expect(screen.getByRole('button', { name: 'Perspective' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Top View' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Front View' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Side View' })).toBeTruthy();
  });
});
