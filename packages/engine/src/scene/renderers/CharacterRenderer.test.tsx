import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F and Three.js hooks/components
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root', traverse: vi.fn(), add: vi.fn() },
    bodyMesh: { morphTargetDictionary: {} },
    morphTargetMap: {},
  })),
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => {
  // Use a proper class for the mock
  class MockAnimator {
    registerClip = vi.fn()
    play = vi.fn()
    setSpeed = vi.fn()
    update = vi.fn()
    dispose = vi.fn()
  }

  return {
    CharacterAnimator: MockAnimator,
    createIdleClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createWalkClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createRunClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createTalkClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createWaveClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createDanceClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createSitClip: vi.fn(() => ({ duration: 1, tracks: [] })),
    createJumpClip: vi.fn(() => ({ duration: 1, tracks: [] })),
  }
})

// Mock other controllers
vi.mock('../../character/FaceMorphController', () => {
  class MockFaceMorphController {
    setTarget = vi.fn()
    update = vi.fn()
    setImmediate = vi.fn()
  }
  return {
    FaceMorphController: MockFaceMorphController,
  }
})

vi.mock('../../character/EyeController', () => {
  class MockEyeController {
    update = vi.fn()
  }
  return {
    EyeController: MockEyeController,
  }
})

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => null),
}))

// @vitest-environment jsdom

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

  it('renders without crashing', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )
    expect(container).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const { container } = render(
      <CharacterRenderer actor={{ ...mockActor, visible: false }} />
    )
    expect(container.firstChild).toBeNull()
  })
})
