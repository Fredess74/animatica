// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SceneManager } from './SceneManager'
import { useActorIds, useSceneStore } from '../store/sceneStore'

// Mock hooks
vi.mock('../store/sceneStore', () => ({
  useActorIds: vi.fn(),
  useAmbientLight: vi.fn(() => ({ intensity: 0.5, color: '#ffffff' })),
  useSun: vi.fn(() => ({ position: [10, 10, 10], intensity: 1, color: '#ffffff' })),
  useSkyColor: vi.fn(() => '#87CEEB'),
  useFog: vi.fn(() => null),
  useCurrentTime: vi.fn(() => 0),
  useSceneStore: vi.fn(),
}))

// Mock SceneActorItem
vi.mock('./SceneActorItem', () => ({
  SceneActorItem: ({ actorId }: { actorId: string }) => (
    <div data-testid={`actor-item-${actorId}`} />
  )
}))

// Mock animation utils
vi.mock('./animationUtils', () => ({
  resolveActiveCamera: vi.fn(() => 'camera-1'),
}))

describe('SceneManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useActorIds as any).mockReturnValue([])
    ;(useSceneStore as any).mockImplementation((selector: any) => selector({ timeline: { cameraTrack: [] } }))
  })

  it('renders actor items for each actor ID', () => {
    ;(useActorIds as any).mockReturnValue(['1', '2'])
    const { getByTestId } = render(<SceneManager />)
    expect(getByTestId('actor-item-1')).toBeDefined()
    expect(getByTestId('actor-item-2')).toBeDefined()
  })
})
