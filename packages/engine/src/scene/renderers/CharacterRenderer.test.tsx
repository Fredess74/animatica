import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock react hooks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
  }
})

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

// Mock Character utilities
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: [],
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    update: vi.fn(),
    setSpeed: vi.fn(),
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

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn(),
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({})),
  })),
}))

vi.mock('../../character/BoneController', () => ({
  BoneController: vi.fn().mockImplementation(() => ({
    setTargetPose: vi.fn(),
    update: vi.fn(),
  })),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => null),
}))

describe('CharacterRenderer', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
    // Directly mock useRef on the React object
    vi.spyOn(React, 'useRef').mockReturnValue({ current: null })
  })

  it('renders a group containing the character rig', () => {
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')
    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    const children = React.Children.toArray(props.children)
    const primitive = children.find((child: any) => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement
    const props = result.props as any
    expect(props.visible).toBe(false)
  })

  it('renders selection ring when selected', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children)
    const ring = children.find((child: any) => child.type === 'mesh')
    expect(ring).toBeDefined()
  })
})
