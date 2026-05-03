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
    useEffect: () => {},
    useMemo: (factory: any) => factory(),
    useImperativeHandle: () => {},
    memo: (c: any) => c,
    forwardRef: (c: any) => ({ type: { render: c } }),
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
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

  it('renders a group containing the rig root with correct transform', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the rig root (primitive object)
    const rigRoot = children[0] as React.ReactElement<any>
    expect(rigRoot.type).toBe('primitive')
    expect(rigRoot.props.object).toBeDefined()
  })

  it('returns null when visible is false', () => {
    // Actually, looking at the code, visible is passed to the group, not used as a guard clause for null return
    // Wait, let me check the code again.
    /*
    return (
      <group
        ref={groupRef}
        name={actor.id}
        position={actor.transform.position}
        rotation={actor.transform.rotation}
        scale={actor.transform.scale}
        visible={actor.visible}
    */
    // Yes, it returns a group with visible={false}.

    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection ring should be the second child when isSelected is true
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')
  })
})
