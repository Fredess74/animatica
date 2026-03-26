/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock createProceduralHumanoid
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', children: [] },
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  }))
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    cleanup()
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
    expect(group?.getAttribute('position')).toBe('10,0,5')
    expect(group?.getAttribute('rotation')).toBe('0,3.141592653589793,0')
    expect(group?.getAttribute('scale')).toBe('1,1,1')
  })

  it('sets visibility on the group', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    const group = container.querySelector('group')
    // React may omit false attributes or set them to null/empty in some environments
    const visible = group?.getAttribute('visible')
    expect(visible === 'false' || visible === null).toBe(true)
  })

  it('renders selection ring when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    // The selection ring is a mesh
    const mesh = container.querySelector('mesh')
    expect(mesh).not.toBeNull()
  })
})
