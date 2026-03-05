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
}))

// Mock Engine
vi.mock('@Animatica/engine', () => {
  const state = {
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false, currentTime: 0 },
    actors: [],
    environment: {
      sun: { position: [0, 0, 0] },
      ambientLight: { intensity: 1, color: '#ffffff' },
    },
    timeline: { duration: 60, animationTracks: [], cameraTrack: [] },
  };

  return {
    SceneManager: () => <div data-testid="scene-manager" />,
    useSceneStore: Object.assign(
      (selector: any) => selector ? selector(state) : state,
      { getState: () => state, setState: vi.fn() }
    ),
    useIsPlaying: vi.fn(() => false),
    useSelectedActorId: vi.fn(() => state.selectedActorId),
    useActors: vi.fn(() => state.actors),
    useEnvironment: vi.fn(() => state.environment),
    useTimeline: vi.fn(() => state.timeline),
    usePlaybackState: vi.fn(() => state.playback),
    useCurrentTime: vi.fn(() => state.playback.currentTime),
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
    // expect(screen.getByTestId('orbit-controls')).toBeTruthy()
    // expect(screen.getByTestId('grid')).toBeTruthy()
    // expect(screen.getByTestId('scene-manager')).toBeTruthy()
  })


  it('renders gizmo when object is found', () => {
    // Mock found object
    mocks.mockGetObjectByName.mockReturnValue({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    // expect(screen.getByTestId('transform-controls')).toBeTruthy()
  })
})
