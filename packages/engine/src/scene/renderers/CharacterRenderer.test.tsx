import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
  }
})

// Mock @react-three/fiber hooks
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

  it('renders a group with correct transform and primitive rig', () => {
    // Call the component as a function to inspect returned JSX
    // Since it's wrapped in memo, we access the underlying function via .type
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the primitive object (the rig)
    const rigPrimitive = children.find(child => (child as any).type === 'primitive') as React.ReactElement
    expect(rigPrimitive).toBeDefined()
    expect((rigPrimitive.props as any).object).toBeInstanceOf(THREE.Group)
  })

  it('returns null when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have primitive rig AND selection mesh
    expect(children.length).toBe(2)

    const selectionMesh = children.find(child => (child as any).type === 'mesh') as React.ReactElement
    expect(selectionMesh).toBeDefined()

    const meshChildren = React.Children.toArray((selectionMesh.props as any).children) as React.ReactElement[]
    expect(meshChildren.some(child => (child as any).type === 'ringGeometry')).toBe(true)
  })
})
