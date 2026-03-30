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
    useRef: (val: any) => ({ current: val }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
  useThree: () => ({}),
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
    const Component = CharacterRenderer.type || CharacterRenderer;
    const result = Component({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the rig (primitive object={rig.root})
    const rigPrimitive = children.find(child => child.type === 'primitive')
    expect(rigPrimitive).toBeDefined()

    const rigObject = (rigPrimitive?.props as any)?.object
    expect(rigObject).toBeInstanceOf(THREE.Group)
  })

  it('renders a group with visible set to false when actor is invisible', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const Component = CharacterRenderer.type || CharacterRenderer;
    const result = Component({ actor: invisibleActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.props.visible).toBe(false)
  })
})
