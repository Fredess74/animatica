// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SceneManager } from './SceneManager'
import * as sceneStore from '../store/sceneStore'

// Mock the store
vi.mock('../store/sceneStore', () => ({
  useSceneStore: vi.fn(),
  useActorList: vi.fn(),
  useEnvironment: vi.fn(),
  useTimeline: vi.fn(),
  useCurrentTime: vi.fn(),
}))

// Mock renderers to render visible elements we can query
vi.mock('./renderers/PrimitiveRenderer', () => ({
  PrimitiveRenderer: () => <div data-testid="primitive-renderer" />
}))
vi.mock('./renderers/LightRenderer', () => ({
  LightRenderer: () => <div data-testid="light-renderer" />
}))
vi.mock('./renderers/CameraRenderer', () => ({
  CameraRenderer: () => <div data-testid="camera-renderer" />
}))
vi.mock('./renderers/CharacterRenderer', () => ({
  CharacterRenderer: () => <div data-testid="character-renderer" />
}))
vi.mock('./renderers/SpeakerRenderer', () => ({
  SpeakerRenderer: () => <div data-testid="speaker-renderer" />
}))

// Mock animation utils
vi.mock('../animation/interpolate', () => ({
  evaluateTracksAtTime: vi.fn(() => new Map()),
}))
vi.mock('./animationUtils', () => ({
  applyAnimationToActor: vi.fn((actor) => actor),
  resolveActiveCamera: vi.fn(() => 'camera-1'),
}))

// Mock Three.js intrinsic elements to avoid React warnings in JSDOM
// We can't easily mock intrinsic elements like <ambientLight> globally without affecting other tests
// or modifying the environment. But typically R3F components in JSDOM just render as custom elements (e.g. <ambientlight>).
// We'll ignore the console errors for unknown elements if necessary, or just focus on our custom renderers.

describe('SceneManager', () => {
  const mockEnvironment = {
    ambientLight: { intensity: 0.5, color: '#ffffff' },
    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
    skyColor: '#87CEEB',
  }
  const mockTimeline = {
    cameraTrack: [],
    animationTracks: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock behaviors
    ;(sceneStore.useActorList as any).mockReturnValue([])
    ;(sceneStore.useEnvironment as any).mockReturnValue(mockEnvironment)
    ;(sceneStore.useTimeline as any).mockReturnValue(mockTimeline)
    ;(sceneStore.useCurrentTime as any).mockReturnValue(0)
  })

  it('renders primitive actors', () => {
    const actors = [{ id: '1', type: 'primitive' }]
    ;(sceneStore.useActorList as any).mockReturnValue(actors)

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('primitive-renderer')).toBeDefined()
  })

  it('renders light actors', () => {
    const actors = [{ id: '2', type: 'light' }]
    ;(sceneStore.useActorList as any).mockReturnValue(actors)

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('light-renderer')).toBeDefined()
  })

  it('renders camera actors', () => {
    const actors = [{ id: '3', type: 'camera' }]
    ;(sceneStore.useActorList as any).mockReturnValue(actors)

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('camera-renderer')).toBeDefined()
  })

  it('renders character actors', () => {
    const actors = [{ id: '4', type: 'character' }]
    ;(sceneStore.useActorList as any).mockReturnValue(actors)

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('character-renderer')).toBeDefined()
  })

  it('renders speaker actors', () => {
    const actors = [{ id: '5', type: 'speaker' }]
    ;(sceneStore.useActorList as any).mockReturnValue(actors)

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('speaker-renderer')).toBeDefined()
  })
})
