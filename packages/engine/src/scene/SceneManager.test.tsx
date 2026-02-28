// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SceneManager } from './SceneManager'
import {
  useActorList,
  useEnvironment,
  useTimelineAnimationTracks,
  useTimelineCameraTrack,
  useCurrentTime
} from '../store/sceneStore'

// Mock the store hooks
vi.mock('../store/sceneStore', () => ({
  useActorList: vi.fn(),
  useEnvironment: vi.fn(),
  useTimelineAnimationTracks: vi.fn(),
  useTimelineCameraTrack: vi.fn(),
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

describe('SceneManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock behaviors
    ;(useActorList as any).mockReturnValue([])
    ;(useEnvironment as any).mockReturnValue({
      ambientLight: { intensity: 0.5, color: '#ffffff' },
      sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
      skyColor: '#87CEEB',
    })
    ;(useTimelineAnimationTracks as any).mockReturnValue([])
    ;(useTimelineCameraTrack as any).mockReturnValue([])
    ;(useCurrentTime as any).mockReturnValue(0)
  })

  it('renders primitive actors', () => {
    ;(useActorList as any).mockReturnValue([{ id: '1', type: 'primitive' }])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('primitive-renderer')).toBeDefined()
  })

  it('renders light actors', () => {
    ;(useActorList as any).mockReturnValue([{ id: '2', type: 'light' }])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('light-renderer')).toBeDefined()
  })

  it('renders camera actors', () => {
    ;(useActorList as any).mockReturnValue([{ id: '3', type: 'camera' }])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('camera-renderer')).toBeDefined()
  })

  it('renders character actors', () => {
    ;(useActorList as any).mockReturnValue([{ id: '4', type: 'character' }])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('character-renderer')).toBeDefined()
  })

  it('renders speaker actors', () => {
    ;(useActorList as any).mockReturnValue([{ id: '5', type: 'speaker' }])

    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('speaker-renderer')).toBeDefined()
  })
})
