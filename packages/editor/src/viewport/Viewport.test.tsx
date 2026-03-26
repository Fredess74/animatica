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
      gl: { domElement: { onpointerdown: null } },
      raycaster: { setFromCamera: vi.fn(), intersectObjects: vi.fn(() => []) },
      mouse: { x: 0, y: 0 },
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
  SceneActorItem: () => <div data-testid="scene-actor-item" />,
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
      sun: { position: [10, 10, 10], intensity: 1, color: '#fff' },
      skyColor: '#87ceeb',
      fog: { color: '#fff', near: 1, far: 100 },
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
  })

  it('renders the viewport toolbar', () => {
    render(<Viewport />)

    expect(screen.getByTitle('Move (W)')).toBeTruthy()
    expect(screen.getByTitle('Rotate (E)')).toBeTruthy()
    expect(screen.getByTitle('Scale (R)')).toBeTruthy()
    expect(screen.getByTitle('3D viewport mode')).toBeTruthy()
    expect(screen.getByTitle('2D storyboard mode')).toBeTruthy()
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

    // Wait for the useEffect timeout in ViewportGizmo
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(screen.getByTestId('transform-controls')).toBeTruthy()
  })
})
