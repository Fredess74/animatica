import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useImperativeHandle: (ref: any, init: any) => {
        if (ref) {
            ref.current = init();
        }
    },
    useCallback: (fn: any) => fn,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}))

// Mock @react-three/drei
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
    // Access the underlying render function from memo(forwardRef)
    const Component = (CharacterRenderer as any).type.render;
    const result = Component({ actor: mockActor }, { current: null });

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([10, 0, 5])
    expect(result.props.rotation).toEqual([0, Math.PI, 0])
    expect(result.props.scale).toEqual([1, 1, 1])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const Component = (CharacterRenderer as any).type.render;
    const result = Component({ actor: invisibleActor }, { current: null });
    expect(result).toBeNull()
  })

  it('renders procedural rig and selection indicator', () => {
    const Component = (CharacterRenderer as any).type.render;
    const result = Component({ actor: mockActor, isSelected: true }, { current: null });

    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // Should have a primitive for the rig
    expect(children.some(c => c.type === 'primitive')).toBe(true)

    // Should have a mesh for selection ring
    const selectionMesh = children.find(c => c.type === 'mesh')
    expect(selectionMesh).toBeDefined()

    const meshChildren = React.Children.toArray(selectionMesh?.props.children) as React.ReactElement[]
    expect(meshChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
