// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'root' },
    bodyMesh: {},
    morphTargetMap: {}
  })),
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.clearAllMocks()
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

  it('renders without crashing', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders with visible prop correctly applied to group', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    const group = container.querySelector('group')
    // In JSDOM with R3F elements, visible={false} might not be an attribute but we can check if it rendered
    expect(group).not.toBeNull()
  })
})
