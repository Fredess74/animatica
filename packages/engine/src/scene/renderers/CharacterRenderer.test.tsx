// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: new THREE.Object3D() }),
    useEffect: () => {},
    useLayoutEffect: () => {},
    useMemo: (fn: any) => fn(),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}))

// Mock the CharacterLoader and controllers
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: () => ({
    root: { isObject3D: true, name: 'Root' },
    bodyMesh: { isMesh: true, morphTargetInfluences: [] },
    morphTargetMap: {}
  })
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    dispose: vi.fn(),
    update: vi.fn(),
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
  FaceMorphController: vi.fn().mockImplementation(() => ({
    update: vi.fn(),
    setTarget: vi.fn(),
    setImmediate: vi.fn(),
  }))
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn().mockReturnValue({}),
  }))
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

  it('renders a group with correct transform', () => {
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: mockActor }) as any

    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([10, 0, 5])
  })

  it('sets visible to false when visible is false', () => {
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: { ...mockActor, visible: false } }) as any
    expect(result.props.visible).toBe(false)
  })

  it('renders primitive for character rig', () => {
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: mockActor }) as any
    const children = React.Children.toArray(result.props.children)
    expect(children.some((c: any) => c.type === 'primitive')).toBe(true)
  })
})
