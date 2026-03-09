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
    useRef: (initialValue: any) => ({ current: initialValue || null }),
    useMemo: (factory: any) => factory(),
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    useImperativeHandle: vi.fn(),
    // Mock forwardRef and memo to facilitate direct testing of the render function
    forwardRef: (render: any) => ({
      render,
      $$typeof: Symbol.for('react.forward_ref')
    }),
    memo: (type: any) => ({
      type,
      $$typeof: Symbol.for('react.memo')
    })
  }
})

// Mock @react-three/fiber hooks
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

  it('renders a group containing the rig rig with correct transform', () => {
    // Access the render function through the mocked memo/forwardRef structure
    // @ts-ignore
    const renderFunc = CharacterRenderer.type.render
    const result = renderFunc({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should contain a primitive for the rig
    const primitive = children.find(child => child.type === 'primitive')
    expect(primitive).toBeDefined()
    expect((primitive?.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const renderFunc = CharacterRenderer.type.render
    const result = renderFunc({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator ring when isSelected is true', () => {
    // @ts-ignore
    const renderFunc = CharacterRenderer.type.render
    const result = renderFunc({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should contain a mesh for the selection ring
    const selectionRing = children.find(child => child.type === 'mesh')
    expect(selectionRing).toBeDefined()

    const ringChildren = React.Children.toArray((selectionRing?.props as any).children) as React.ReactElement[]
    expect(ringChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
