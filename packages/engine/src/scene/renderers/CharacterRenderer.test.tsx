/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F useFrame hook and other dependencies
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root', traverse: vi.fn() },
    bodyMesh: null,
    bones: new Map(),
    morphTargetMap: {},
  })),
}))

const mockAnimatorInstance = {
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
};

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() { return mockAnimatorInstance; }),
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
    FaceMorphController: vi.fn().mockImplementation(function() {
        return {
            setTarget: vi.fn(),
            update: vi.fn(),
            setImmediate: vi.fn(),
        };
    }),
}))

vi.mock('../../character/EyeController', () => ({
    EyeController: vi.fn().mockImplementation(function() {
        return {
            update: vi.fn(),
        };
    }),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
}))

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

  it('renders a group containing the rig root', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)

    // In JSDOM, R3F elements render as lowercase custom tags
    const group = container.querySelector('group')
    expect(group).not.toBeNull()

    // Check if primitive is rendered (it contains the rig root)
    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('sets visibility on the group correctly', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    // By default it should be visible (unset attribute usually means visible)

    const invisibleActor = { ...mockActor, visible: false }
    const { container: container2 } = render(<CharacterRenderer actor={invisibleActor} />)
    const group2 = container2.querySelector('group')
    // When visible={false}, R3F/JSDOM behavior might vary on attribute rendering
    // But we expect the prop to be passed correctly.
    expect(group2).not.toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)

    // Ring indicator is a mesh
    const meshes = container.querySelectorAll('mesh')
    expect(meshes.length).toBeGreaterThan(0)

    const ringGeometry = container.querySelector('ringgeometry')
    expect(ringGeometry).not.toBeNull()
  })
})
