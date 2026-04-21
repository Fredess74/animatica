import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useCallback: (cb: any) => cb,
  }
})

// Mock react-three-fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock character loader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: {},
  })),
}))

// Mock character animator
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
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

// Mock face morph controller
vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn(),
  })),
}))

// Mock eye controller
vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(),
  })),
}))

// Mock character presets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
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
      scale: [1, 1, 1]
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group with correct transform', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor })

    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([10, 0, 5])
    expect(result.props.rotation).toEqual([0, Math.PI, 0])
    expect(result.props.scale).toEqual([1, 1, 1])
    expect(result.props.visible).toBe(true)
  })

  it('contains a primitive for the character rig', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor })
    const children = React.Children.toArray(result.props.children)

    const primitive = children.find((child: any) => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('renders selection ring when isSelected is true', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor, isSelected: true })
    const children = React.Children.toArray(result.props.children)

    const ringMesh = children.find((child: any) => child.type === 'mesh')
    expect(ringMesh).toBeDefined()
  })
})
