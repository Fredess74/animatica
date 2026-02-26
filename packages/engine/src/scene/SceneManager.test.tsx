// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SceneManager } from './SceneManager'
import { useSceneStore } from '../store/sceneStore'

// Mock the store
vi.mock('../store/sceneStore', () => ({
  useSceneStore: vi.fn(),
}))

// Mock SceneObject to verify it's being used
vi.mock('./SceneObject', () => ({
  SceneObject: (props: any) => (
    <div data-testid="scene-object" data-props={JSON.stringify(props)} />
  ),
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
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default store mock behavior
    ;(useSceneStore as any).mockImplementation((selector: any) => {
      const state = {
        actors: [],
        environment: {
          ambientLight: { intensity: 0.5, color: '#ffffff' },
          sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
          skyColor: '#87CEEB',
        },
        timeline: {
          cameraTrack: [],
          animationTracks: [],
        },
        playback: {
          currentTime: 0,
        },
      }
      return selector(state)
    })
  })

  it('renders all actors using SceneObject', () => {
    const actors = [
      { id: '1', type: 'primitive' },
      { id: '2', type: 'light' },
    ]
    ;(useSceneStore as any).mockImplementation((selector: any) => {
       const state = {
         actors,
         environment: { ambientLight: {}, sun: {}, skyColor: '#000' },
         timeline: { cameraTrack: [], animationTracks: [] },
         playback: { currentTime: 0 },
       }
       return selector(state)
    })

    render(<SceneManager />)
    const sceneObjects = screen.getAllByTestId('scene-object')
    expect(sceneObjects).toHaveLength(2)

    // Check first actor
    const props1 = JSON.parse(sceneObjects[0].getAttribute('data-props') || '{}')
    expect(props1.actor).toEqual(expect.objectContaining({ id: '1' }))

    // Check second actor
    const props2 = JSON.parse(sceneObjects[1].getAttribute('data-props') || '{}')
    expect(props2.actor).toEqual(expect.objectContaining({ id: '2' }))
  })

  it('passes selected status to SceneObject', () => {
    const actors = [{ id: '1', type: 'primitive' }]
    ;(useSceneStore as any).mockImplementation((selector: any) => {
       const state = {
         actors,
         environment: { ambientLight: {}, sun: {}, skyColor: '#000' },
         timeline: { cameraTrack: [], animationTracks: [] },
         playback: { currentTime: 0 },
       }
       return selector(state)
    })

    render(<SceneManager selectedActorId="1" />)
    const sceneObject = screen.getByTestId('scene-object')
    const props = JSON.parse(sceneObject.getAttribute('data-props') || '{}')
    expect(props.isSelected).toBe(true)
  })

  it('passes showHelpers to SceneObject', () => {
    const actors = [{ id: '1', type: 'light' }]
    ;(useSceneStore as any).mockImplementation((selector: any) => {
       const state = {
         actors,
         environment: { ambientLight: {}, sun: {}, skyColor: '#000' },
         timeline: { cameraTrack: [], animationTracks: [] },
         playback: { currentTime: 0 },
       }
       return selector(state)
    })

    render(<SceneManager showHelpers={true} />)
    const sceneObject = screen.getByTestId('scene-object')
    const props = JSON.parse(sceneObject.getAttribute('data-props') || '{}')
    expect(props.showHelpers).toBe(true)
  })
})
