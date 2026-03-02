import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useMemo: (factory: () => any) => factory(),
    useEffect: () => {},
    useCallback: (cb: any) => cb,
    useImperativeHandle: (ref: any, factory: () => any) => {
      if (ref) ref.current = factory()
    },
    memo: (c: any) => c,
    forwardRef: (render: any) => ({
        type: { render },
        render // for direct access
    })
  }
})

// Mock @react-three/fiber
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
    clothing: {
        head: [],
        torso: [],
        arms: [],
        legs: []
    }
  }

  it('renders a group with correct transform and a primitive rig', () => {
    // Access the render function. Since we mocked forwardRef to return an object with 'render',
    // and CharacterRenderer is that object.
    const renderFunc = (CharacterRenderer as any).render || (CharacterRenderer as any).type.render
    const result = renderFunc({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the character rig (primitive)
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')

    const rigObject = (rigPrimitive.props as any).object
    expect(rigObject).toBeInstanceOf(THREE.Group)

    // The procedural rig should have children (bones)
    expect(rigObject.children.length).toBeGreaterThan(0)
    expect(rigObject.children[0].type).toBe('Bone')
    expect(rigObject.children[0].name).toBe('Hips')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const renderFunc = (CharacterRenderer as any).render || (CharacterRenderer as any).type.render
    const result = renderFunc({ actor: invisibleActor }, { current: null })
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    const renderFunc = (CharacterRenderer as any).render || (CharacterRenderer as any).type.render
    const result = renderFunc({ actor: mockActor, isSelected: true }, { current: null }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection indicator mesh
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')

    const meshChildren = React.Children.toArray((selectionRing.props as any).children) as React.ReactElement[]
    expect(meshChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
