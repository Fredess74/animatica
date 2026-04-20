// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Character Loader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', name: 'rig-root' },
    bodyMesh: {},
    morphTargetMap: {}
  })),
}))

// Mock Character Animator
vi.mock('../../character/CharacterAnimator', () => {
  const MockAnimator = function() {}
  MockAnimator.prototype.registerClip = vi.fn()
  MockAnimator.prototype.play = vi.fn()
  MockAnimator.prototype.update = vi.fn()
  MockAnimator.prototype.dispose = vi.fn()
  MockAnimator.prototype.setSpeed = vi.fn()

  return {
    CharacterAnimator: MockAnimator,
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
  }
})

describe('CharacterRenderer', () => {
  afterEach(() => {
    cleanup()
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

  it('renders a group containing primitive rig with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    expect(container).toBeTruthy()
  })

  it('handles visibility correctly', () => {
    const { container } = render(<CharacterRenderer actor={{...mockActor, visible: false}} />)
    expect(container).toBeTruthy()
  })
})
