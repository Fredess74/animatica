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
    Canvas: ({ children, onCreated }: any) => {
      // Trigger onCreated to satisfy any initialization logic
      React.useEffect(() => {
        if (onCreated) onCreated({ gl: { outputColorSpace: '' } })
      }, [])
      return <div data-testid="canvas">{children}</div>
    },
    useThree: () => ({
      scene: { getObjectByName: mocks.mockGetObjectByName },
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { domElement: document.createElement('canvas') },
    }),
    useFrame: () => {},
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

// Mock SceneRenderer
vi.mock('./SceneRenderer', () => ({
  SceneRenderer: () => <div data-testid="scene-manager" />,
}))

// Mock Engine
vi.mock('@Animatica/engine', () => ({
  useSceneStore: (selector: any) => selector({
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false },
    actors: [
        {
            id: 'test-actor-id',
            name: 'Test Actor',
            transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] }
        }
    ],
    environment: {
      ambientLight: { intensity: 0.5, color: '#ffffff' },
      sun: { intensity: 1, color: '#ffffff', position: [10, 10, 10] },
      skyColor: '#88ccff',
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
    expect(screen.getByTestId('orbit-controls')).toBeTruthy()
    expect(screen.getByTestId('grid')).toBeTruthy()
    expect(screen.getByTestId('scene-manager')).toBeTruthy()
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

    // Wait for the timeout in ViewportGizmo
    expect(await screen.findByTestId('transform-controls')).toBeTruthy()
  })
})
