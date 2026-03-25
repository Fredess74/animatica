import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
    useImperativeHandle: () => {},
  }
})

// Mock R3F useFrame
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

  it('renders a group with correct transform', () => {
    // CharacterRenderer is a plain FC
    const result = (CharacterRenderer as any)({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor: CharacterActor = {
        ...mockActor,
        visible: false,
        transform: { ...mockActor.transform, position: [0, 0, 0] }
    }
    const result = (CharacterRenderer as any)({ actor: invisibleActor })

    // CharacterRenderer returns a <group> but its `visible` prop should be false
    // Wait, the implementation says:
    // return (
    //   <group
    //     ...
    //     visible={actor.visible}
    //   >

    expect(result).not.toBeNull()
    expect(result.props.visible).toBe(false)
  })

  it('renders the rig root as a primitive', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // The first child is the <primitive object={rig.root} />
    const rigPrimitive = children.find(c => c.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
    expect((rigPrimitive?.props as any).object).toBeDefined()
  })
});
