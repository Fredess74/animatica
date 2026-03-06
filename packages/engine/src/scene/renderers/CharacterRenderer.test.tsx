import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react-three-fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
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

  it('renders a group containing primitive rig with correct transform', () => {
    // CharacterRenderer is wrapped in React.memo
    // We render it to verify the structure
    const { container } = render(<CharacterRenderer actor={mockActor} />)

    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('position')).toBe('10,0,5')

    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const ring = container.querySelector('ringGeometry')
    expect(ring).not.toBeNull()
  })
})
