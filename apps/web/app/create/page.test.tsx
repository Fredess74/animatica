// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreatePage from './page';

// Mock ResizeObserver
beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock @Animatica/editor
vi.mock('@Animatica/editor', () => ({
  EditorLayout: ({ viewport }: { viewport: React.ReactNode }) => (
    <div data-testid="editor-layout">
      <div>Editor Layout</div>
      <div data-testid="editor-viewport">{viewport}</div>
    </div>
  ),
}));

// Mock @Animatica/engine
vi.mock('@Animatica/engine', () => ({
  SceneManager: () => <div data-testid="scene-manager">Scene Manager</div>,
}));

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
}));

describe('Create Page', () => {
  it('renders editor layout', () => {
    render(<CreatePage />);
    expect(screen.getAllByTestId('editor-layout')[0]).toBeDefined();
  });

  it('renders scene manager inside viewport', () => {
    render(<CreatePage />);
    expect(screen.getAllByTestId('r3f-canvas')[0]).toBeDefined();
    expect(screen.getAllByTestId('scene-manager')[0]).toBeDefined();
  });
});
