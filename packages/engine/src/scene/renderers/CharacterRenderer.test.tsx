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
    useCallback: vi.fn((fn) => fn),
    memo: (component: any) => {
      component.displayName = 'MemoizedComponent'
      return {
        type: component,
        $$typeof: Symbol.for('react.memo')
      }
    }
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

  it('renders a group containing capsule mesh with correct transform', () => {
    // Call the component function directly
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

    // First child should be the primitive rig root
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect(rigPrimitive.props.object).toBeInstanceOf(THREE.Group)
  })

  it('renders with visible prop set to false when actor is hidden', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: invisibleActor })
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing).toBeDefined()
    expect(selectionRing.type).toBe('mesh')
  })
})
