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
    useRef: () => ({ current: null }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
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

  it('renders a group containing procedural rig with correct transform', () => {
    // Since it's wrapped in memo, we access the underlying function via .type
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the procedural rig (primitive object={rig.root})
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect((rigPrimitive.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection ring when selected', () => {
     // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1] as React.ReactElement
    expect(selectionRing.type).toBe('mesh')
    const selectionRingProps = selectionRing.props as any
    const meshChildren = React.Children.toArray(selectionRingProps.children) as React.ReactElement[]
    expect(meshChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
