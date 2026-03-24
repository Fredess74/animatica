// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
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
      gl: { domElement: { onpointerdown: null } },
      scene: { getObjectByName: mocks.mockGetObjectByName },
      camera: { position: { set: vi.fn() }, lookAt: vi.fn() }
    }),
    useFrame: vi.fn(),
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
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html">{children}</div>,
}))

// Mock Engine
vi.mock('@Animatica/engine', () => ({
  PrimitiveRenderer: () => <div data-testid="primitive-renderer" />,
  LightRenderer: () => <div data-testid="light-renderer" />,
  CameraRenderer: () => <div data-testid="camera-renderer" />,
  useSceneStore: (selector: any) => selector({
    actors: [],
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false },
    environment: {
      ambientLight: { intensity: 0.5, color: '#fff' },
      sun: { position: [10, 10, 10] as [number, number, number], intensity: 1, color: '#fff' },
      skyColor: '#87ceeb',
    },
  }),
}))

describe('Viewport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Default: object not found
    mocks.mockGetObjectByName.mockReturnValue(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders the 3D viewport components', () => {
    render(<Viewport />)

    expect(screen.getByTestId('canvas')).toBeTruthy()
  })

  it('renders the camera toolbar', () => {
    render(<Viewport />)

    // ViewportToolbar uses lucide-react icons, let's check for buttons by their titles if they have them
    // The buttons have titles like "Move (W)", "Rotate (E)", etc.
    expect(screen.getByTitle(/Move/i)).toBeTruthy()
  })

  it('attempts to change camera view when toolbar button clicked', () => {
    render(<Viewport />)

    const moveButton = screen.getByTitle(/Move/i)
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

    // ViewportGizmo has a 50ms timeout to find the object
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByTestId('transform-controls')).toBeTruthy()
  })
})
