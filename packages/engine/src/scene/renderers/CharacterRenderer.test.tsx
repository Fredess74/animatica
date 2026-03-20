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
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock the Character related logic
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group' },
    bodyMesh: {},
    morphTargetMap: {}
  }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn()
  })),
  createDanceClip: vi.fn(),
  createIdleClip: vi.fn(),
  createJumpClip: vi.fn(),
  createRunClip: vi.fn(),
  createSitClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWalkClip: vi.fn(),
  createWaveClip: vi.fn(),
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn()
  }))
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({}))
  }))
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 }
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
    // Call the functional component directly
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement<{ [key: string]: any }>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    expect(result.props.position).toEqual([10, 0, 5])
    expect(result.props.rotation).toEqual([0, Math.PI, 0])
    expect(result.props.scale).toEqual([1, 1, 1])
  })

  it('renders a primitive for the rig', () => {
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const primitive = children.find((c) => c.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('renders a selection ring when isSelected is true', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const ring = children.find((c) => c.type === 'mesh')
    expect(ring).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement<{ [key: string]: any }>

    // Note: In CharacterRenderer.tsx, the group's visible prop is set, but the component still returns the group.
    // Wait, let's check the code...
    // <group ... visible={actor.visible} ...>
    // So it should still render the group but with visible=false.
    expect(result.props.visible).toBe(false)
  })
})
