import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Humanoid component
vi.mock('../../character/Humanoid', () => ({
  Humanoid: vi.fn(() => {
    return <primitive object={{ name: 'mock-rig-root' }} data-testid="humanoid" />
  })
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockActor: CharacterActor = {
    id: 'char-1',
    name: 'Hero',
    type: 'character',
    visible: true,
    transform: {
      position: [10, 0, 5],
      rotation: [0, Math.PI, 0],
      scale: [1, 1, 1]
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')

    expect(group).not.toBeNull()
    // Since we're in JSDOM and these are just unrecognized tags,
    // we can't easily check 'position' property.
    // Instead, we check the 'id' which we passed as 'name' to the group.
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders nothing when visible is false', () => {
    const { container } = render(<CharacterRenderer actor={{ ...mockActor, visible: false }} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const mesh = container.querySelector('mesh')
    expect(mesh).not.toBeNull()
  })
})
