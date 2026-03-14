/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { Humanoid } from './Humanoid'
import { CharacterActor } from '../types'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useEffect: vi.fn(),
    useMemo: (fn: any) => fn(),
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Drei
vi.mock('@react-three/drei', () => {
  const mockUseGLTF = vi.fn()
  // @ts-ignore
  mockUseGLTF.preload = vi.fn()
  return {
    useGLTF: mockUseGLTF
  }
})

// Mock CharacterAnimator
vi.mock('./CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
    setSpeed: vi.fn(),
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
}))

describe('Humanoid', () => {
  const mockScene = new THREE.Group()
  const mockMesh = new THREE.SkinnedMesh()
  mockMesh.name = 'Body'
  const mockHips = new THREE.Bone()
  mockHips.name = 'Hips'
  const mockHead = new THREE.Bone()
  mockHead.name = 'Head'

  mockScene.add(mockMesh, mockHips, mockHead)

  const mockActor: CharacterActor = {
    id: 'char-1',
    name: 'Hero',
    type: 'character',
    modelUrl: 'https://example.com/model.glb',
    visible: true,
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGLTF).mockReturnValue({
      scene: mockScene,
      animations: [],
    })
  })

  it('renders correctly with modelUrl', () => {
    // Note: Calling component as a function for inspection in unit test
    const Component = Humanoid as any;
    const result = Component({ actor: mockActor });

    expect(result.type).toBe('primitive')
    expect(result.props.object).toBeDefined()
  })

  it('calls useGLTF with modelUrl', () => {
    const Component = Humanoid as any;
    Component({ actor: mockActor });
    expect(useGLTF).toHaveBeenCalledWith(mockActor.modelUrl)
  })
})
