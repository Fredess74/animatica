import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial || null }),
    useEffect: () => {},
    useMemo: (factory: any) => factory(),
  }
})

// Mock R3F hooks
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

  it('renders a group with correct transform', () => {
    // Call the component as a function to inspect returned JSX
    // Since it's wrapped in memo, we access the underlying component via .type
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the rig (primitive)
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect((rigPrimitive.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection ring only when isSelected is true', () => {
    const Component = (CharacterRenderer as any).type

    // Test with isSelected = true
    const selectedResult = Component({ actor: mockActor, isSelected: true }) as React.ReactElement<any>
    const selectedChildren = React.Children.toArray(selectedResult.props.children) as React.ReactElement[]

    // Should have rig + selection ring
    expect(selectedChildren.length).toBe(2)
    expect(selectedChildren[1].type).toBe('mesh')
    expect((selectedChildren[1].props as any).children[0].type).toBe('ringGeometry')

    // Test with isSelected = false
    const normalResult = Component({ actor: mockActor, isSelected: false }) as React.ReactElement<any>
    const normalChildren = React.Children.toArray(normalResult.props.children) as React.ReactElement[]

    // Should only have rig
    expect(normalChildren.length).toBe(1)
    expect(normalChildren[0].type).toBe('primitive')
  })
})
