import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
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
  }
})

// Mock @react-three/fiber's useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {}
}))

// Mock CharacterLoader since it creates THREE objects that might fail in JSDOM or without R3F context
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  }))
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
    // Access the underlying render function from the memo(forwardRef()) component
    const Component = (CharacterRenderer as any).type.render
    const result = Component({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Rig is rendered via <primitive object={rig.root} />
    const rigPrimitive = children.find(child => child.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
    expect((rigPrimitive?.props as any).object).toBeInstanceOf(THREE.Group)
  })

  it('sets visibility to false when actor.visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const Component = (CharacterRenderer as any).type.render
    const result = Component({ actor: invisibleActor }, null)

    expect(result).not.toBeNull()
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    const Component = (CharacterRenderer as any).type.render
    const result = Component({ actor: mockActor, isSelected: true }, null) as React.ReactElement

    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection indicator is a mesh
    const selectionIndicator = children.find(child => child.type === 'mesh')
    expect(selectionIndicator).toBeDefined()

    const indicatorChildren = React.Children.toArray((selectionIndicator?.props as any).children) as React.ReactElement[]
    expect(indicatorChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
