import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useMemo: (fn: any) => fn(),
    useEffect: vi.fn(),
    useRef: () => ({ current: null }),
    useImperativeHandle: vi.fn(),
    forwardRef: (render: any) => ({ type: { render } }),
    memo: (comp: any) => comp,
  }
})

// Mock useFrame from @react-three/fiber
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

  it('renders a group containing capsule mesh with correct transform', () => {
    // Call the forwardRef component's render function directly
    // Since it's wrapped in memo, we access the underlying forwardRef via .type
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify rig composition
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Primary child should be the <primitive /> for rig.root
    const rigRoot = children[0]
    expect(rigRoot.type).toBe('primitive')
    expect((rigRoot.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    // CharacterRenderer now return group with visible prop, so we check that
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: { ...mockActor, visible: false } }, { current: null })
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, { current: null })
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child (after primitive) should be selection mesh
    const selectionMesh = children[1]
    expect(selectionMesh).toBeDefined()
    // @ts-ignore
    expect(selectionMesh.type).toBe('mesh')
  })
})
