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
    useRef: () => ({ current: null }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useLayoutEffect: () => {},
    useCallback: (fn: any) => fn,
    useImperativeHandle: () => {},
  }
})

// Mock @react-three/fiber hooks
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
    name: 'Human',
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
    // Since it's wrapped in memo(forwardRef), we access the underlying render function via .type.render
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('renders primitive for character rig', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // The first child is the <primitive object={rig.root} />
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')

    // rig.root is a THREE.Group
    expect((rigPrimitive.props as any).object).toBeInstanceOf(THREE.Group)
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, { current: null }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection ring should be the second child
    const ring = children[1]
    expect(ring.type).toBe('mesh')
  })
})
