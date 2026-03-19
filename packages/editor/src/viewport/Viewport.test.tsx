// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Viewport } from './Viewport'
import React from 'react'

// Mock ResizeObserver
// @ts-ignore
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Hoist mocks
const mocks = vi.hoisted(() => ({
  mockSetSelectedActor: vi.fn(),
  mockUpdateActor: vi.fn(),
  mockGetObjectByName: vi.fn(),
  mockGoToPreset: vi.fn(),
}))

// Mock viewport components
vi.mock('./ViewportControls', () => ({
  ViewportControls: () => <div data-testid="viewport-controls" />,
  useCameraPreset: () => ({ goToPreset: mocks.mockGoToPreset }),
}))

vi.mock('./ViewportToolbar', () => ({
  ViewportToolbar: () => <div data-testid="viewport-toolbar" />
}))

vi.mock('./ViewportOverlay', () => ({
  ViewportOverlay: () => <div data-testid="viewport-overlay" />
}))

vi.mock('./EnvironmentRenderer', () => ({
  EnvironmentRenderer: () => <div data-testid="environment-renderer" />
}))

vi.mock('./SceneRenderer', () => ({
  SceneRenderer: () => <div data-testid="scene-renderer" />
}))

vi.mock('./ViewportGrid', () => ({
  ViewportGrid: () => <div data-testid="viewport-grid" />
}))

vi.mock('./ViewportGizmo', () => ({
  ViewportGizmo: () => <div data-testid="viewport-gizmo" />
}))

// Mock R3F
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber')
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
    useThree: () => ({
      scene: { getObjectByName: mocks.mockGetObjectByName },
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { domElement: document.createElement('canvas') }
    }),
  }
})

// Mock Engine
vi.mock('@Animatica/engine', () => ({
  useSceneStore: (selector: any) => selector({
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false },
    actors: [],
  }),
}))

describe('Viewport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all main sub-components', () => {
    render(<Viewport />)

    expect(screen.getByTestId('viewport-toolbar')).toBeTruthy()
    expect(screen.getByTestId('canvas')).toBeTruthy()
    expect(screen.getByTestId('environment-renderer')).toBeTruthy()
    expect(screen.getByTestId('viewport-grid')).toBeTruthy()
    expect(screen.getByTestId('scene-renderer')).toBeTruthy()
    expect(screen.getByTestId('viewport-gizmo')).toBeTruthy()
    expect(screen.getByTestId('viewport-controls')).toBeTruthy()
    expect(screen.getByTestId('viewport-overlay')).toBeTruthy()
  })
})
