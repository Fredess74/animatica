/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: function() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      setSpeed: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    }
  },
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
  FaceMorphController: function() {
    return {
      setTarget: vi.fn(),
      update: vi.fn(),
      setImmediate: vi.fn(),
    }
  },
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: function() {
    return {
      update: vi.fn(),
    }
  },
}))

// Mock CharacterPresets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: {
      skinColor: '#D4A27C',
      height: 1.0,
      build: 0.5,
    },
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
      scale: [1, 1, 1],
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {},
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    expect(container).toBeDefined()
  })

  it('handles visibility', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container).toBeDefined()
  })
})
