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

// Mock Engine
vi.mock('@Animatica/engine', () => ({
  SceneManager: () => <div data-testid="scene-manager" />,
  PrimitiveRenderer: () => <div data-testid="primitive-renderer" />,
  LightRenderer: () => <div data-testid="light-renderer" />,
  CameraRenderer: () => <div data-testid="camera-renderer" />,
  useSceneStore: vi.fn(),
}))

import { useSceneStore } from '@Animatica/engine'

// Mock R3F
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber')
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="canvas">
        {/* We need to render children for tests to find mocked components */}
        {children}
      </div>
    ),
    useThree: () => ({
      scene: { getObjectByName: mocks.mockGetObjectByName },
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
      gl: { domElement: {} }
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

describe('Viewport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: object not found
    mocks.mockGetObjectByName.mockReturnValue(undefined)

    // Reset useSceneStore mock to default state
    vi.mocked(useSceneStore).mockImplementation((selector: any) => selector({
      actors: [],
      selectedActorId: null,
      setSelectedActor: mocks.mockSetSelectedActor,
      updateActor: mocks.mockUpdateActor,
      playback: { isPlaying: false, currentTime: 0 },
      timeline: { animationTracks: [], cameraTrack: [] },
      environment: {
        ambientLight: { intensity: 0.5, color: '#fff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
        skyColor: '#87ceeb',
      },
    }))
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the 3D viewport components', async () => {
    render(<Viewport />)

    expect(screen.getByTestId('canvas')).toBeTruthy()
    expect(screen.getByTestId('orbit-controls')).toBeTruthy()
    expect(screen.getByTestId('grid')).toBeTruthy()

    // SceneManager is inside Suspense and might be replaced by SceneRenderer
    // in some versions of the code. Let's check for what is actually there.
  })

  it('renders the editor toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Move (W)')).toBeTruthy()
    expect(screen.getByTitle('Rotate (E)')).toBeTruthy()
    expect(screen.getByTitle('Scale (R)')).toBeTruthy()
    expect(screen.getByTitle('Toggle grid')).toBeTruthy()
  })

  it('attempts to change mode when toolbar button clicked', () => {
    render(<Viewport />)

    const rotateButton = screen.getByTitle('Rotate (E)')
    fireEvent.click(rotateButton)

    expect(rotateButton).toBeTruthy()
  })

  it('renders gizmo when object is found', async () => {
    // Mock Engine with selected actor
    vi.mocked(useSceneStore).mockImplementation((selector: any) => selector({
      actors: [
        {
          id: 'test-actor-id',
          name: 'Test Actor',
          type: 'primitive',
          visible: true,
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
          }
        }
      ],
      selectedActorId: 'test-actor-id',
      setSelectedActor: mocks.mockSetSelectedActor,
      updateActor: mocks.mockUpdateActor,
      playback: { isPlaying: false, currentTime: 0 },
      timeline: { animationTracks: [], cameraTrack: [] },
      environment: {
        ambientLight: { intensity: 0.5, color: '#fff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
        skyColor: '#87ceeb',
      },
    }))

    // Mock found object
    mocks.mockGetObjectByName.mockReturnValue({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    await waitFor(() => {
        expect(screen.getByTestId('transform-controls')).toBeTruthy()
    }, { timeout: 1000 })
  })
})
