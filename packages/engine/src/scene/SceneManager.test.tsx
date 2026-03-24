// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SceneManager } from './SceneManager'

// Mock the store
vi.mock('../store/sceneStore', () => ({
  useSceneStore: vi.fn(),
  useAmbientLight: vi.fn(),
  useSun: vi.fn(),
  useSkyColor: vi.fn(),
  useFog: vi.fn(),
  useActorIds: vi.fn(),
  useCameraTrack: vi.fn(),
  useCurrentTime: vi.fn(),
  useActorById: vi.fn(),
  useActorTracks: vi.fn(),
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

import {
  useAmbientLight,
  useSun,
  useSkyColor,
  useFog,
  useActorIds,
  useCameraTrack,
  useCurrentTime,
  useActorById,
  useActorTracks,
} from '../store/sceneStore';

describe('SceneManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock behaviors
    ;(useAmbientLight as any).mockReturnValue({ intensity: 0.5, color: '#ffffff' })
    ;(useSun as any).mockReturnValue({ position: [10, 10, 10], intensity: 1, color: '#ffffff' })
    ;(useSkyColor as any).mockReturnValue('#87CEEB')
    ;(useFog as any).mockReturnValue(undefined)
    ;(useActorIds as any).mockReturnValue([])
    ;(useCameraTrack as any).mockReturnValue([])
    ;(useCurrentTime as any).mockReturnValue(0)
  })

  it('renders primitive actors', () => {
    const actor = { id: '1', type: 'primitive', visible: true }
    ;(useActorIds as any).mockReturnValue(['1'])
    ;(useActorById as any).mockImplementation((id: string) => id === '1' ? actor : null)
    ;(useActorTracks as any).mockReturnValue([])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('primitive-renderer')).toBeDefined()
  })

  it('renders light actors', () => {
    const actor = { id: '2', type: 'light', visible: true }
    ;(useActorIds as any).mockReturnValue(['2'])
    ;(useActorById as any).mockImplementation((id: string) => id === '2' ? actor : null)
    ;(useActorTracks as any).mockReturnValue([])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('light-renderer')).toBeDefined()
  })

  it('renders camera actors', () => {
    const actor = { id: '3', type: 'camera', visible: true }
    ;(useActorIds as any).mockReturnValue(['3'])
    ;(useActorById as any).mockImplementation((id: string) => id === '3' ? actor : null)
    ;(useActorTracks as any).mockReturnValue([])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('camera-renderer')).toBeDefined()
  })

  it('renders character actors', () => {
    const actor = { id: '4', type: 'character', visible: true }
    ;(useActorIds as any).mockReturnValue(['4'])
    ;(useActorById as any).mockImplementation((id: string) => id === '4' ? actor : null)
    ;(useActorTracks as any).mockReturnValue([])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('character-renderer')).toBeDefined()
  })

  it('renders speaker actors', () => {
    const actor = { id: '5', type: 'speaker', visible: true }
    ;(useActorIds as any).mockReturnValue(['5'])
    ;(useActorById as any).mockImplementation((id: string) => id === '5' ? actor : null)
    ;(useActorTracks as any).mockReturnValue([])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('speaker-renderer')).toBeDefined()
  })
})
