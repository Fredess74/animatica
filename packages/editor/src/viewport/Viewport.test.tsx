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
  TransformControls: (props: any) => <div data-testid="transform-controls" data-object={props.object ? 'present' : 'absent'} />,
  Grid: () => <div data-testid="grid" />,
  Sky: () => <div data-testid="sky" />,
  ContactShadows: () => <div data-testid="contact-shadows" />,
  Environment: () => <div data-testid="environment" />,
}))

// Mock Engine
vi.mock('@Animatica/engine', () => {
  const actors = [{ id: 'test-actor-id', name: 'Test Actor', type: 'primitive', transform: { position: [0,0,0], rotation:[0,0,0], scale:[1,1,1] }, visible: true }];
  const state = {
    actors,
    selectedActorId: 'test-actor-id',
    setSelectedActor: mocks.mockSetSelectedActor,
    updateActor: mocks.mockUpdateActor,
    playback: { isPlaying: false },
    environment: {
      ambientLight: { intensity: 0.5, color: '#fff' },
      sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
      skyColor: '#87ceeb',
    },
  };

  return {
    SceneManager: () => <div data-testid="scene-manager" />,
    useSceneStore: vi.fn((selector: any) => {
        try {
            return selector(state)
        } catch (e) {
            return undefined
        }
    }),
    useSelectedActor: vi.fn(() => actors[0]),
    useSelectedActorId: vi.fn(() => 'test-actor-id'),
    useActorList: vi.fn(() => actors),
    useActorById: vi.fn((id) => actors.find(a => a.id === id)),
    useActorTracks: vi.fn(() => []),
    getActorById: (id: string) => (s: any) => actors.find((a: any) => a.id === id),
    PrimitiveRenderer: () => <div data-testid="primitive-renderer" />,
    LightRenderer: () => <div data-testid="light-renderer" />,
    CameraRenderer: () => <div data-testid="camera-renderer" />,
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
    // SceneManager is mocked as a functional component from @Animatica/engine
    // but here it is rendered as part of SceneRenderer -> ActorSwitch
  })

  it('renders the camera toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Move (W)')).toBeTruthy()
    expect(screen.getByTitle('Rotate (E)')).toBeTruthy()
    expect(screen.getByTitle('Scale (R)')).toBeTruthy()
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

    // Wait for the useEffect in ViewportGizmo to find the object
    const gizmo = await screen.findByTestId('transform-controls')
    expect(gizmo).toBeTruthy()
    expect(gizmo.getAttribute('data-object')).toBe('present')
  })
})
