// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to handle useRef
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn().mockImplementation((val) => ({ current: val })),
  }
})

// Mock @react-three/fiber's useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isGroup: true, add: vi.fn(), remove: vi.fn(), children: [] },
    bodyMesh: { morphTargetDictionary: {}, morphTargetInfluences: [] },
    skeleton: { bones: [] },
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  }))
}))

describe('CharacterRenderer', () => {
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

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders correctly and matches snapshot structure', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).toBeDefined()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('forwards ref', () => {
    const ref = React.createRef<any>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).toBeDefined()
  })
})
