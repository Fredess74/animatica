import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    memo: vi.fn((c) => c),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock @react-three/drei
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
    // Call the component function directly
    const result = (CharacterRenderer as any)({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should contain a primitive object (the rig)
    const rigPrimitive = children.find(child => child.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
    expect((rigPrimitive?.props as any).object).toBeInstanceOf(THREE.Group)
  })

  it('sets visibility on the group', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = (CharacterRenderer as any)({ actor: invisibleActor }) as React.ReactElement
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have a selection ring (mesh with ringGeometry)
    const selectionRing = children.find(child => {
        if (child.type !== 'mesh') return false
        const meshChildren = React.Children.toArray(child.props.children)
        return meshChildren.some(c => (c as any).type === 'ringGeometry')
    })
    expect(selectionRing).toBeDefined()
  })
})
