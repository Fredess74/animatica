import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock THREE
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    Group: class {
        name = ''
        position = { set: vi.fn() }
        rotation = { set: vi.fn() }
        scale = { set: vi.fn() }
        visible = true
    },
    Vector3: actual.Vector3,
    DoubleSide: actual.DoubleSide
  }
})

// Mock internal utilities
vi.mock('../../character/CharacterLoader', () => ({
    createProceduralHumanoid: vi.fn(() => ({
        root: { type: 'Group' },
        bodyMesh: {},
        morphTargetMap: {}
    }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
    CharacterAnimator: vi.fn(() => ({
        registerClip: vi.fn(),
        play: vi.fn(),
        dispose: vi.fn(),
        update: vi.fn(),
        setSpeed: vi.fn()
    })),
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
}))

vi.mock('../../character/FaceMorphController', () => ({
    FaceMorphController: vi.fn(() => ({
        setTarget: vi.fn(),
        update: vi.fn(),
        setImmediate: vi.fn()
    }))
}))

vi.mock('../../character/EyeController', () => ({
    EyeController: vi.fn(() => ({
        update: vi.fn()
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
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have a primitive for the rig
    const rigPrimitive = children.find(c => (c as React.ReactElement).type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    // Note: The component itself returns a <group visible={false}> when visible is false,
    // it doesn't return null unless we specifically code it to.
    // Looking at the implementation, it returns the group with visible prop.
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement
    expect((result.props as any).visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have a mesh for selection indicator
    const selectionMesh = children.find(c => (c as React.ReactElement).type === 'mesh')
    expect(selectionMesh).toBeDefined()
  })
})
