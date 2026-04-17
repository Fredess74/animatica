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
    memo: (c: any) => c,
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock useFrame
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

  it('renders a group containing primitive rig with correct transform', () => {
    // Component is now a regular functional component wrapped in memo
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child is the rig (primitive)
    const rig = children[0]
    expect(rig.type).toBe('primitive')

    const rigProps = rig.props as any
    expect(rigProps.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
     // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Find the selection ring (mesh)
    const selectionRing = children.find(c => c.type === 'mesh')
    expect(selectionRing).toBeDefined()

    const ringProps = selectionRing?.props as any
    expect(ringProps?.rotation).toEqual([-Math.PI / 2, 0, 0])
  })
})
