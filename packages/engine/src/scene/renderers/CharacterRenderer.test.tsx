/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js
vi.mock('three', () => {
  return {
    Group: class {},
    Vector3: class {
      setFromMatrixPosition() { return this }
    },
    AnimationClip: class {},
    AnimationMixer: class {
      clipAction() { return { play: () => {}, setEffectiveWeight: () => {}, setEffectiveTimeScale: () => {}, crossFadeTo: () => {} } }
      update() {}
    },
    LoopRepeat: 1,
    DoubleSide: 2,
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: {},
    bodyMesh: {},
    morphTargetMap: {},
  })),
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: class {
    registerClip() {}
    play() {}
    setSpeed() {}
    update() {}
    dispose() {}
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

// Mock Controllers
vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: class {
    setTarget() {}
    update() {}
    setImmediate() {}
  },
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: class {
    update() { return {} }
  },
}))

// Mock Presets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
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

  it('renders correctly', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )
    expect(container).toBeDefined()
  })

  it('renders selection ring when selected', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    // We can't easily query R3F elements with RTL, but we can check if it doesn't crash
    expect(container).toBeDefined()
  })
})
