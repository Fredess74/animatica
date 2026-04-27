// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
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
      gl: { domElement: document.createElement('canvas') },
    }),
  }
})

// Mock Drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  TransformControls: () => <div data-testid="transform-controls" />,
  Grid: () => <div data-testid="grid" />,
  Sky: () => <div data-testid="sky" />,
  ContactShadows: () => <div data-testid="contact-shadows" />,
  Environment: () => <div data-testid="environment" />,
}))

// Mock Engine
vi.mock('@Animatica/engine', () => ({
  SceneManager: () => <div data-testid="scene-manager" />,
  useSceneStore: (selector: any) => selector({
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false, currentTime: 0 },
    environment: {
      ambientLight: { intensity: 0.5, color: '#fff' },
      sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
      skyColor: '#87ceeb',
    },
    timeline: { duration: 10, fps: 24 },
    actors: [],
  }),
  useActorList: () => [],
  useActiveActors: () => [],
  useEnvironment: () => ({
    ambientLight: { intensity: 0.5, color: '#fff' },
    sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
    skyColor: '#87ceeb',
  }),
  useTimeline: () => ({
    duration: 10,
    fps: 24,
  }),
  useCurrentTime: () => 0,
  useSceneActions: () => ({
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
  }),
  usePlaybackState: () => ({
    isPlaying: false,
    currentTime: 0,
  }),
}))

// Mock Sub-components
vi.mock('./SceneRenderer', () => ({
  SceneRenderer: () => <div data-testid="scene-renderer" />
}))
vi.mock('./ViewportGrid', () => ({
  ViewportGrid: () => <div data-testid="viewport-grid" />
}))
vi.mock('./ViewportControls', () => ({
  ViewportControls: () => <div data-testid="viewport-controls" />
}))
vi.mock('./ViewportGizmo', () => ({
  ViewportGizmo: () => <div data-testid="viewport-gizmo" />
}))
vi.mock('./ViewportToolbar', () => ({
  ViewportToolbar: (props: any) => (
    <div data-testid="viewport-toolbar">
      <button title="Top View">Top</button>
      <button title="Front View">Front</button>
      <button title="Side View">Side</button>
      <button title="Perspective View">Perspective</button>
      <button title="2D Mode" onClick={() => props.onViewModeChange('2d')}>2D</button>
    </div>
  )
}))
vi.mock('./ViewportOverlay', () => ({
  ViewportOverlay: () => <div data-testid="viewport-overlay" />
}))
vi.mock('./EnvironmentRenderer', () => ({
  EnvironmentRenderer: () => <div data-testid="environment-renderer" />
}))
vi.mock('./Viewport2D', () => ({
  Viewport2D: () => <div data-testid="viewport-2d" />
}))

describe('Viewport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: object not found
    mocks.mockGetObjectByName.mockReturnValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the 3D viewport components', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Viewport />)

    expect(screen.getByTestId('canvas')).toBeTruthy()
    expect(screen.getByTestId('viewport-grid')).toBeTruthy()
    expect(screen.getByTestId('scene-renderer')).toBeTruthy()
    consoleSpy.mockRestore();
  })

  it('renders the camera toolbar', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Viewport />)

    expect(screen.getByTitle('Top View')).toBeTruthy()
    expect(screen.getByTitle('Front View')).toBeTruthy()
    expect(screen.getByTitle('Side View')).toBeTruthy()
    expect(screen.getByTitle('Perspective View')).toBeTruthy()
    consoleSpy.mockRestore();
  })

  it('attempts to change view mode when toolbar button clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Viewport />)

    const toggle2D = screen.getByTitle('2D Mode')
    fireEvent.click(toggle2D)

    expect(screen.getByTestId('viewport-2d')).toBeTruthy()
    consoleSpy.mockRestore();
  })

  it('renders gizmo when object is found', () => {
    mocks.mockGetObjectByName.mockReturnValue({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Viewport />)

    expect(screen.getByTestId('viewport-gizmo')).toBeTruthy()
    consoleSpy.mockRestore();
  })
})
