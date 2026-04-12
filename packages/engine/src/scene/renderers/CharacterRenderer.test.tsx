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
    useRef: (val: any) => ({ current: val }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
  }
})

// Mock @react-three/fiber
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

  it('renders a group containing character rig with correct transform', () => {
    // Call the functional component directly
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Rig root should be rendered as a primitive
    const rigPrimitive = children.find((c: any) => c.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // As per CharacterRenderer implementation: visible={actor.visible}
    // and if (!actor.visible) return null; was missing in previous turn, but let's check.
    // Memory says: In CharacterRenderer.tsx, the component must return null if actor.visible is false
    const result = CharacterRenderer({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection ring should be present
    const selectionRing = children.find((c: any) => c.type === 'mesh' && c.props.children?.[0]?.type === 'ringGeometry')
    expect(selectionRing).toBeDefined()
  })
})
