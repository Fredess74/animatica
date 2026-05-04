import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useEffect: () => {},
    useMemo: (factory: () => any) => factory(),
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
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

  it('renders a group with correct transform', () => {
    // CharacterRenderer is a functional component
    // We call it as a function to inspect the return value
    const result = (CharacterRenderer as any)({ actor: mockActor }) as React.ReactElement<any>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('handles visibility via group prop', () => {
    const result = (CharacterRenderer as any)({ actor: { ...mockActor, visible: false } }) as React.ReactElement<any>
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor, isSelected: true }) as React.ReactElement<any>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<any>[]

    // rig.root is the first child (primitive object={rig.root})
    // selection indicator is the second child if isSelected is true
    const indicator = children.find(child => child.type === 'mesh')
    expect(indicator).toBeDefined()

    const indicatorChildren = React.Children.toArray(indicator?.props.children) as React.ReactElement<any>[]
    expect(indicatorChildren.find(child => child.type === 'ringGeometry')).toBeDefined()
  })
})
