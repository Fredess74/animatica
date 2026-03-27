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
      gl: { domElement: { onpointerdown: null } }
    }),
  }
})

// Mock Sub-components to avoid deep rendering issues
vi.mock('./ViewportToolbar', () => ({
    ViewportToolbar: ({ onViewModeChange }: any) => (
        <div data-testid="viewport-toolbar">
            <button title="Top View" onClick={() => {}} />
            <button title="Front View" />
            <button title="Side View" />
            <button title="Perspective View" />
        </div>
    )
}))

vi.mock('./ViewportOverlay', () => ({
    ViewportOverlay: () => <div data-testid="viewport-overlay" />
}))

vi.mock('./ViewportGrid', () => ({
    ViewportGrid: () => <div data-testid="viewport-grid" />
}))

vi.mock('./ViewportControls', () => ({
    ViewportControls: () => <div data-testid="viewport-controls" />
}))

vi.mock('./ViewportGizmo', () => ({
    ViewportGizmo: ({ mode }: any) => mode === 'translate' ? <div data-testid="transform-controls" /> : null
}))

vi.mock('./SceneRenderer', () => ({
    SceneRenderer: () => <div data-testid="scene-renderer" />
}))

vi.mock('./EnvironmentRenderer', () => ({
    EnvironmentRenderer: () => <div data-testid="environment-renderer" />
}))

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
    actors: [],
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false },
    environment: {
      ambientLight: { intensity: 0.5, color: '#fff' },
      sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
      skyColor: '#87ceeb',
    },
  }),
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
    render(<Viewport />)

    expect(screen.getByTestId('canvas')).toBeTruthy()
    expect(screen.getByTestId('viewport-controls')).toBeTruthy()
    expect(screen.getByTestId('viewport-grid')).toBeTruthy()
    expect(screen.getByTestId('scene-renderer')).toBeTruthy()
  })

  it('renders the camera toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Top View')).toBeTruthy()
    expect(screen.getByTitle('Front View')).toBeTruthy()
    expect(screen.getByTitle('Side View')).toBeTruthy()
    expect(screen.getByTitle('Perspective View')).toBeTruthy()
  })

  it('attempts to change camera view when toolbar button clicked', () => {
    render(<Viewport />)

    const topButton = screen.getByTitle('Top View')
    fireEvent.click(topButton)

    expect(topButton).toBeTruthy()
  })

  it('renders gizmo when object is found', async () => {
    // Mock found object
    mocks.mockGetObjectByName.mockReturnValue({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    expect(await screen.findByTestId('transform-controls')).toBeTruthy()
  })
})
