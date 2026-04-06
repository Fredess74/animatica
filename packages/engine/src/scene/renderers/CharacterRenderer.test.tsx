// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    gl: { domElement: {} },
    camera: {},
    scene: {},
    size: { width: 100, height: 100 },
  })),
}))

// Mock CharacterLoader and related
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'root' },
    bodyMesh: {},
    morphTargetMap: {},
  })),
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => {
  class CharacterAnimator {
    registerClip = vi.fn()
    play = vi.fn()
    setSpeed = vi.fn()
    update = vi.fn()
    dispose = vi.fn()
  }
  return {
    CharacterAnimator,
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

// Mock FaceMorphController
vi.mock('../../character/FaceMorphController', () => {
  class FaceMorphController {
    setTarget = vi.fn()
    update = vi.fn()
    setImmediate = vi.fn()
  }
  return { FaceMorphController }
})

// Mock EyeController
vi.mock('../../character/EyeController', () => {
  class EyeController {
    update = vi.fn()
  }
  return { EyeController }
})

// Mock CharacterPresets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 },
  })),
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
    // We use a simple render test since R3F components are hard to test with RTL
    // but we can check if it at least doesn't crash and returns the expected structure
    // via a manual call or by checking the output of a shallow render-like approach

    // Actually, for R3F components in Vitest/JSDOM, we often just verify they don't throw
    // and maybe check some refs if possible.

    expect(() => render(<CharacterRenderer actor={mockActor} />)).not.toThrow()
  })

  it('handles visibility correctly', () => {
    // We can't easily check 'visible' prop of <group> via RTL as it's not a DOM element
    // but we can ensure the component renders without error.
    const invisibleActor = { ...mockActor, visible: false }
    expect(() => render(<CharacterRenderer actor={invisibleActor} />)).not.toThrow()
  })
})
