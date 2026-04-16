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
    useRef: () => ({ current: new THREE.Group() }),
    useMemo: (fn: any) => fn(),
    useEffect: vi.fn(),
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

  it('renders a group with correct transform and a primitive rig', () => {
    // Call the functional component directly
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: mockActor }) as React.ReactElement

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
    expect((primitive?.props as any).object.type).toBe('Group')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator ring when isSelected is true', () => {
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should contain a mesh for the selection ring
    const selectionRing = children.find(child => child.type === 'mesh')
    expect(selectionRing).toBeDefined()

    const ringChildren = React.Children.toArray((selectionRing?.props as any).children) as React.ReactElement[]
    expect(ringChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
