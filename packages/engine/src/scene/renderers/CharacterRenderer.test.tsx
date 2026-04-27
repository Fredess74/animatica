import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useEffect: vi.fn(),
    useMemo: (factory: any) => factory(),
  }
})

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group' }, // Mock THREE.Group
    bodyMesh: {},
    morphTargetMap: {}
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
    // CharacterRenderer is a functional component (React.FC)
    // We call it directly as a function to inspect the returned JSX
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify it contains the rig root (primitive object)
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const rigPrimitive = children.find(child => child.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    const selectionRing = children.find(child => child.type === 'mesh' && (child.props as any)['data-testid'] === 'selection-ring')
    expect(selectionRing).toBeDefined()
  })
})
