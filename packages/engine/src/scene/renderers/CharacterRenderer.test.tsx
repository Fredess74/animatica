import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react for specialized component testing
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    // When using memo(forwardRef), tests often need to access .type.render
    forwardRef: (render: any) => ({ render, type: { render } }),
    memo: (comp: any) => comp,
    useRef: (initial: any) => ({ current: initial || null }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useImperativeHandle: () => {},
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

  it('renders a group containing primitive with correct transform', () => {
    // Call the component's render function to inspect the output
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the rig primitive
    const rigPrimitive = children[0] as React.ReactElement
    expect(rigPrimitive.type).toBe('primitive')
    const rigPrimitiveProps = rigPrimitive.props as any
    expect(rigPrimitiveProps.object).toBeDefined()
  })

  it('renders with visible prop correctly set from actor', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null) as React.ReactElement
    const props = result.props as any
    expect(props.visible).toBe(false)
  })

  it('renders selection indicator ring when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1] as React.ReactElement
    expect(selectionRing.type).toBe('mesh')

    const selectionRingProps = selectionRing.props as any
    const ringChildren = React.Children.toArray(selectionRingProps.children) as React.ReactElement[]
    expect(ringChildren.some(child => (child as React.ReactElement).type === 'ringGeometry')).toBe(true)
  })
})
