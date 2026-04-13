import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js group and other elements used by R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock our character-related controllers and loaders to keep tests light
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root' },
    bodyMesh: null,
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
    setSpeed: vi.fn(),
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
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn(() => ({
    update: vi.fn(),
  })),
}))

vi.mock('../../character/BoneController', () => ({
  BoneController: vi.fn(() => ({
    setPose: vi.fn(),
  })),
}))

// Mock React to provide stable mock hooks for all tests
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
  }
})

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
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

  it('renders a group containing the rig root with correct transform', () => {
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([10, 0, 5])

    const children = React.Children.toArray(result.props.children) as React.ReactElement[]
    expect(children[0].type).toBe('primitive')
    expect(children[0].props.object.name).toBe('rig-root')
  })

  it('returns null when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders a selection ring when isSelected is true', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // children[0] is rig root, children[1] should be the selection ring
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')
  })
})
