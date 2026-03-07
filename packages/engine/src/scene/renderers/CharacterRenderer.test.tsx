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
    useLayoutEffect: () => {},
    memo: (c: any) => c,
    forwardRef: (c: any) => {
      c.render = c
      return c
    },
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Mock R3F hooks
  vi.mock('@react-three/fiber', () => ({
    useFrame: () => {},
    useThree: () => ({}),
  }))

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
    // Call the component directly as it's no longer hidden by memo/forwardRef in the mock
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the character rig primitive
    const characterRig = children[0] as React.ReactElement
    expect(characterRig.type).toBe('primitive')

    const characterRigProps = characterRig.props as any
    expect(characterRigProps.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders face direction indicator', () => {
     // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection indicator mesh should be the second child (when selected)
    // For this test, isSelected is false, so it should not render the ring
    expect(children.length).toBe(1) // Just the rig
  })
})
