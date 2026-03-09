// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
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
      camera: { position: { set: vi.fn(), clone: () => ({ lerpVectors: vi.fn() }) }, lookAt: vi.fn() },
      gl: { domElement: {} }
    }),
  }
})

// Mock Drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  TransformControls: () => <div data-testid="transform-controls" />,
  Grid: () => <div data-testid="grid" />,
  Sky: () => null,
  ContactShadows: () => null,
  Environment: () => null,
}))

// Mock Engine
vi.mock('@Animatica/engine', () => ({
  SceneManager: () => <div data-testid="scene-manager" />,
  useSceneStore: (selector: any) => selector({
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    actors: [],
    playback: { isPlaying: false },
    environment: {
        sun: { position: [0, 10, 0], intensity: 1, color: '#ffffff' },
        ambientLight: { intensity: 0.5, color: '#ffffff' }
    }
  }),
  PrimitiveRenderer: () => null,
  LightRenderer: () => null,
  CameraRenderer: () => null,
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
    expect(screen.getByTestId('orbit-controls')).toBeTruthy()
    expect(screen.getByTestId('grid')).toBeTruthy()
  })

  it('renders the gizmo toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Move (W)')).toBeTruthy()
    expect(screen.getByTitle('Rotate (E)')).toBeTruthy()
    expect(screen.getByTitle('Scale (R)')).toBeTruthy()
    expect(screen.getByTitle('Toggle grid')).toBeTruthy()
  })

  it('attempts to change gizmo mode when toolbar button clicked', () => {
    render(<Viewport />)

    const rotateButton = screen.getByTitle('Rotate (E)')
    fireEvent.click(rotateButton)

    expect(rotateButton).toBeTruthy()
  })

  it('renders gizmo when object is found', async () => {
    // Mock found object
    mocks.mockGetObjectByName.mockReturnValue({
        name: 'test-actor-id',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    // ViewportGizmo has a 50ms timeout to find the object
    await waitFor(() => {
        expect(screen.getByTestId('transform-controls')).toBeTruthy()
    }, { timeout: 1000 })
  })
})
