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
vi.mock('@Animatica/engine', () => ({
  SceneManager: () => <div data-testid="scene-manager" />,
  useSceneStore: (selector: any) => {
    const state = {
      selectedActorId: 'test-actor-id',
      setSelectedActor: mocks.mockSetSelectedActor,
      updateActor: mocks.mockUpdateActor,
      playback: { isPlaying: false },
      environment: {
        ambientLight: { intensity: 0.5, color: '#fff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
        skyColor: '#87ceeb',
        weather: { type: 'clear' },
        fog: { enabled: false },
      },
      actors: [],
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
  PrimitiveRenderer: () => null,
  LightRenderer: () => null,
  CameraRenderer: () => null,
  getActorById: (id: string) => (state: any) => ({ id, name: 'Test Actor', transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] } }),
}))

// Mock SceneRenderer
vi.mock('./SceneRenderer', () => ({
  SceneRenderer: () => <div data-testid="scene-renderer" />,
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
    expect(screen.getByTestId('orbit-controls')).toBeTruthy()
    expect(screen.getByTestId('grid')).toBeTruthy()
    expect(screen.getByTestId('scene-renderer')).toBeTruthy()
  })

  it('renders the toolbar buttons', () => {
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
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    })

    render(<Viewport />)

    // Fast-forward the 50ms timeout in ViewportGizmo
    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(screen.getByTestId('transform-controls')).toBeTruthy()
  })
})
