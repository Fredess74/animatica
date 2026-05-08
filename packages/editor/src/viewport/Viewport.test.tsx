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
      gl: { domElement: document.createElement('canvas') }
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
  GizmoHelper: () => <div data-testid="gizmo-helper" />,
  GizmoViewport: () => <div data-testid="gizmo-viewport" />,
}))

// Mock Engine
vi.mock('@Animatica/engine', () => {
  const state = {
    actors: [],
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    removeActor: vi.fn(),
    playback: { isPlaying: false, currentTime: 0, speed: 1, direction: 1, loopMode: 'none', frameRate: 24 },
    environment: {
      ambientLight: { intensity: 0.5, color: '#fff' },
      sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
      skyColor: '#87ceeb',
    },
    timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
    setPlayback: vi.fn(),
  };

  return {
    SceneManager: () => <div data-testid="scene-manager" />,
    PrimitiveRenderer: () => <div data-testid="primitive-renderer" />,
    LightRenderer: () => <div data-testid="light-renderer" />,
    CameraRenderer: () => <div data-testid="camera-renderer" />,
    useSceneStore: vi.fn((selector: any) => selector(state)),
    useActors: vi.fn(() => state.actors),
    useSelectedActorId: vi.fn(() => state.selectedActorId),
    useSelectedActor: vi.fn(() => undefined),
    useEnvironment: vi.fn(() => state.environment),
    useTimeline: vi.fn(() => state.timeline),
    usePlaybackState: vi.fn(() => state.playback),
    useCurrentTime: vi.fn(() => state.playback.currentTime),
    useIsPlaying: vi.fn(() => state.playback.isPlaying),
  };
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
    expect(screen.getByTestId('scene-manager')).toBeTruthy()
  })

  it('renders the camera toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Move (W)')).toBeTruthy()
    expect(screen.getByTitle('Rotate (E)')).toBeTruthy()
    expect(screen.getByTitle('Scale (R)')).toBeTruthy()
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
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    expect(await screen.findByTestId('transform-controls')).toBeTruthy()
  })
})
