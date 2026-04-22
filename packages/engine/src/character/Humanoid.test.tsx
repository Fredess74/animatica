import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { Humanoid } from './Humanoid'
import * as CharacterLoader from './CharacterLoader'
import * as CharacterAnimator from './CharacterAnimator'

// Mock CharacterLoader
vi.mock('./CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'procedural-root', add: vi.fn(), remove: vi.fn() },
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  })),
  extractRig: vi.fn(() => ({
    root: { name: 'glb-root', add: vi.fn(), remove: vi.fn() },
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  }))
}))

// Mock CharacterAnimator
vi.mock('./CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn()
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
  createRunClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWaveClip: vi.fn(),
  createDanceClip: vi.fn(),
  createSitClip: vi.fn(),
  createJumpClip: vi.fn()
}))

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({
    scene: { clone: vi.fn(() => ({ traverse: vi.fn() })) },
    animations: []
  })),
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    // Custom mock for useEffect to run it immediately for testing if needed
    // but standard behavior is usually fine for these shallow-ish tests
  }
})

describe('Humanoid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders procedural model when no url is provided', () => {
    // @ts-ignore - calling component directly to avoid R3F Canvas requirement in simple test
    const result = Humanoid({ animation: 'idle' }) as React.ReactElement

    // In our implementation, Humanoid returns ProceduralModel when url is missing
    expect(result.type.name).toBe('ProceduralModel')
    expect(CharacterLoader.createProceduralHumanoid).not.toHaveBeenCalled() // Only called inside useEffect of ProceduralModel
  })

  it('renders GLBModel in Suspense when url is provided', () => {
    const url = 'test-model.glb'
    // @ts-ignore
    const result = Humanoid({ url, animation: 'idle' }) as React.ReactElement

    expect(result.type).toBe(React.Suspense)
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]
    expect(children[0].type.name).toBe('GLBModel')
    expect(children[0].props.url).toBe(url)
  })
})
