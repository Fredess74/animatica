/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

// Mock THREE
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    Vector3: class {
      setFromMatrixPosition = vi.fn().mockReturnThis()
    },
    DoubleSide: 2,
  }
})

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', children: [], isObject3D: true },
    bodyMesh: { morphTargetInfluences: [] },
    morphTargetMap: {},
  })),
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => {
  return {
    CharacterAnimator: function(this: any) {
      this.registerClip = vi.fn();
      this.play = vi.fn();
      this.setSpeed = vi.fn();
      this.update = vi.fn();
      this.dispose = vi.fn();
    },
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
vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: function(this: any) {
    this.setTarget = vi.fn();
    this.update = vi.fn();
    this.setImmediate = vi.fn();
  },
}))

// Mock EyeController
vi.mock('../../character/EyeController', () => ({
  EyeController: function(this: any) {
    this.update = vi.fn();
  },
}))

// Mock CharacterPresets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 }
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

  it('renders without crashing', () => {
    // Suppress React Three Fiber warnings about unrecognized tags in jsdom
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    expect(container).toBeDefined()

    consoleSpy.mockRestore();
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders group with correct ID', () => {
    // Suppress React Three Fiber warnings
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    // R3F renders <group name="char-1" ...>
    const group = container.querySelector(`group[name="${mockActor.id}"]`);
    expect(group).not.toBeNull()

    consoleSpy.mockRestore();
  })
})
