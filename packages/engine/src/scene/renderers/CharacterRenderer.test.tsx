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
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (factory: any) => factory(),
    useEffect: vi.fn(),
    memo: (fn: any) => {
        const component = (props: any) => fn(props)
        component.type = fn
        return component
    }
  }
})

// Mock R3F useFrame
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn()
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
    createProceduralHumanoid: vi.fn(() => ({
        root: { name: 'root' },
        bodyMesh: {},
        morphTargetMap: {}
    }))
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
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child is the primitive object (the rig root)
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect((rigPrimitive.props as any).object.name).toBe('root')
  })

  it('sets visible prop to false when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: invisibleActor })
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')
    const meshChildren = React.Children.toArray((selectionRing.props as any).children) as React.ReactElement[]
    expect(meshChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
