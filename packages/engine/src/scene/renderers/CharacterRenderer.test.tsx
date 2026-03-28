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
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    useImperativeHandle: vi.fn(),
    // Keep memo and forwardRef as is or ensure they don't break
    memo: (c: any) => c,
    forwardRef: (c: any) => ({ type: { render: c } }),
  }
})

// Mock @react-three/fiber
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

  it('renders a group containing primitive rig with correct transform', () => {
    // Since we mocked forwardRef to return { type: { render: c } }, we can access it
    // @ts-ignore
    const result = (CharacterRenderer as any).type.render({ actor: mockActor }, null) as any

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as any[]

    // First child should be the primitive rig
    const primitive = children[0]
    expect(primitive.type).toBe('primitive')
    expect(primitive.props.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = (CharacterRenderer as any).type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection ring when selected', () => {
     // @ts-ignore
    const result = (CharacterRenderer as any).type.render({ actor: mockActor, isSelected: true }, null) as any
    const props = result.props
    const children = React.Children.toArray(props.children) as any[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')
    const ringProps = selectionRing.props

    const ringChildren = React.Children.toArray(ringProps.children) as any[]
    const geometry = ringChildren.find(c => c.type === 'ringGeometry')
    expect(geometry).toBeDefined()
    expect(geometry.props.args).toEqual([0.4, 0.5, 32])

    const material = ringChildren.find(c => c.type === 'meshBasicMaterial')
    expect(material).toBeDefined()
    expect(material.props.color).toBe('#22C55E')
  })
})
