import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Humanoid } from './Humanoid'
import { CharacterActor } from '../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    memo: (fn: any) => fn,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}))

// Mock dependencies
vi.mock('./CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bones: new Map(),
    bodyMesh: new THREE.SkinnedMesh(),
    morphTargetMap: {},
    animations: []
  }))
}))

vi.mock('./CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    update: vi.fn(),
    setSpeed: vi.fn(),
    dispose: vi.fn()
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

vi.mock('./FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn()
  }))
}))

vi.mock('./BoneController', () => ({
  BoneController: vi.fn().mockImplementation(() => ({
    setPose: vi.fn()
  }))
}))

vi.mock('./EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({}))
  }))
}))

describe('Humanoid', () => {
  const mockActor: CharacterActor = {
    id: 'char-1',
    name: 'Hero',
    type: 'character',
    visible: true,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group with a primitive object', () => {
    // @ts-ignore
    const result = Humanoid({ actor: mockActor }) as React.ReactElement
    expect(result.type).toBe('group')

    const children = React.Children.toArray(result.props.children)
    expect(children.some((c: any) => c.type === 'primitive')).toBe(true)
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = Humanoid({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children)
    expect(children.some((c: any) => c.type === 'mesh')).toBe(true)
  })
})
