/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js and R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'root' },
    bones: new Map(),
    bodyMesh: null,
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function(this: any) {
    this.registerClip = vi.fn()
    this.play = vi.fn()
    this.update = vi.fn()
    this.dispose = vi.fn()
    this.setSpeed = vi.fn()
  }),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
  createRunClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWaveClip: vi.fn(),
  createDanceClip: vi.fn(),
  createSitClip: vi.fn(),
  createJumpClip: vi.fn(),
}))

vi.mock('../../character/BoneController', () => ({
  BoneController: vi.fn().mockImplementation(function(this: any) {
    this.setPose = vi.fn()
    this.update = vi.fn()
  }),
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(function(this: any) {
    this.setTarget = vi.fn()
    this.update = vi.fn()
  }),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function(this: any) {
    this.update = vi.fn()
  }),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
}))

describe('CharacterRenderer', () => {
  const mockActor: CharacterActor = {
    id: 'char-1',
    name: 'Hero',
    type: 'character',
    visible: true,
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
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
    expect(container.firstChild).not.toBeNull()
  })

  it('renders a group with correct name', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders selection ring when isSelected is true', () => {
    const { container, rerender } = render(
      <CharacterRenderer actor={mockActor} isSelected={false} />
    )
    // Check for mesh with ringGeometry
    expect(container.querySelector('ringGeometry')).toBeNull()

    rerender(<CharacterRenderer actor={mockActor} isSelected={true} />)
    expect(container.querySelector('ringGeometry')).not.toBeNull()
  })
})
