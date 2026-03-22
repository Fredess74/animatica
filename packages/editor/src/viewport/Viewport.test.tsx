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
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { domElement: { onpointerdown: null } },
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
vi.mock('@Animatica/engine', async () => {
  const actual = await vi.importActual<typeof import('@Animatica/engine')>('@Animatica/engine')
  return {
    ...actual,
    useSceneStore: (selector: any) => selector({
      actors: [
        { id: '1', type: 'primitive', visible: true, transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] }, properties: { shape: 'box', color: '#ff0000' } }
      ],
      selectedActorId: 'test-actor-id',
      setSelectedActor: mocks.mockSetSelectedActor,
      updateActor: mocks.mockUpdateActor,
      playback: { isPlaying: false, currentTime: 0 },
      timeline: { duration: 60, animationTracks: [] },
      environment: {
        ambientLight: { intensity: 0.5, color: '#fff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
        skyColor: '#87ceeb',
      },
    }),
    usePlaybackControls: () => ({
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      seek: vi.fn(),
    }),
  }
})

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
    // Find any actor element rendered by SceneRenderer
    // In our mock, we added a primitive actor
    // The SceneRenderer uses ActorSwitch which uses PrimitiveRenderer
    // We didn't mock PrimitiveRenderer, so it should render its default behavior
  })

  it('renders the viewport toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Move (W)')).toBeTruthy()
    expect(screen.getByTitle('Rotate (E)')).toBeTruthy()
    expect(screen.getByTitle('Scale (R)')).toBeTruthy()
    expect(screen.getByTitle('Toggle grid')).toBeTruthy()
  })

  it('attempts to change gizmo mode when toolbar button clicked', () => {
    render(<Viewport />)

    const moveButton = screen.getByTitle('Move (W)')
    fireEvent.click(moveButton)

    expect(moveButton).toBeTruthy()
  })

  it('renders gizmo when object is found', async () => {
    // Mock found object
    mocks.mockGetObjectByName.mockReturnValue({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    // Wait for the useEffect timeout in ViewportGizmo
    await waitFor(() => {
      expect(screen.getByTestId('transform-controls')).toBeTruthy()
    })
  })
})
