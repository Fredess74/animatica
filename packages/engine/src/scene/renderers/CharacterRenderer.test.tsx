import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js
vi.mock('three', () => {
  const Vector3 = vi.fn().mockImplementation(() => ({
    setFromMatrixPosition: vi.fn().mockReturnThis(),
  }))
  return {
    Vector3,
    DoubleSide: 2,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock rig creation
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn().mockReturnValue({
    root: { id: 'rig-root' },
    bodyMesh: {},
    morphTargetMap: {},
  }),
}))

// Mock animator
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
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

// Mock face morph and eye controllers
vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn(),
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn().mockReturnValue({}),
  })),
}))

// Mock presets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn().mockReturnValue({
    body: { skinColor: '#ffffff', height: 1.0, build: 0.5 },
  }),
}))

// Mock React hooks
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

describe('CharacterRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
      scale: [1, 1, 1],
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {},
  }

  it('renders a group with correct transform', () => {
    // Access the inner component from React.memo
    const InnerComponent = (CharacterRenderer as any).type || CharacterRenderer
    const result = InnerComponent({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('sets visibility on group', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const InnerComponent = (CharacterRenderer as any).type || CharacterRenderer
    const result = InnerComponent({ actor: invisibleActor }) as React.ReactElement

    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    const InnerComponent = (CharacterRenderer as any).type || CharacterRenderer
    const result = InnerComponent({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children)

    // rig + selection mesh
    expect(children.length).toBe(2)

    const selectionMesh = children[1] as any
    expect(selectionMesh.type).toBe('mesh')
  })
})
