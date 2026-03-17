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
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useImperativeHandle: vi.fn(),
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
    clothing: {}
  }

  it('renders a group containing primitive object with correct transform', () => {
    // Access the underlying render function from memo/forwardRef
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement<any>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Child should be the primitive object (the rig root)
    const primitive = children.find(child => (child as any).type === 'primitive') as React.ReactElement
    expect(primitive).toBeDefined()
    expect((primitive.props as any).object).toBeInstanceOf(THREE.Object3D)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement<any>
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // Should have primitive AND the selection mesh
    const selectionMesh = children.find(child => (child as any).type === 'mesh') as React.ReactElement
    expect(selectionMesh).toBeDefined()

    const meshProps = selectionMesh.props as any
    const meshChildren = React.Children.toArray(meshProps.children) as React.ReactElement[]

    expect(meshChildren.find(c => (c as any).type === 'ringGeometry')).toBeDefined()
    expect(meshChildren.find(c => (c as any).type === 'meshBasicMaterial')).toBeDefined()
  })
})
