/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import { CharacterAnimator } from '../../character/CharacterAnimator'
import { BoneController } from '../../character/BoneController'

// Mock Three.js and R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'humanoid-root' },
    bones: new Map(),
    bodyMesh: null,
    morphTargetMap: {},
  })),
}))

const mockAnimatorInstance = {
  registerClip: vi.fn(),
  play: vi.fn(),
  update: vi.fn(),
  dispose: vi.fn(),
  setSpeed: vi.fn(),
}

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() {
    return mockAnimatorInstance;
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

const mockBoneControllerInstance = {
  setPose: vi.fn(),
  update: vi.fn(),
}

vi.mock('../../character/BoneController', () => ({
  BoneController: vi.fn().mockImplementation(function() {
    return mockBoneControllerInstance;
  }),
}))

const mockFaceMorphControllerInstance = {
  setTarget: vi.fn(),
  update: vi.fn(),
}

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(function() {
    return mockFaceMorphControllerInstance;
  }),
}))

const mockEyeControllerInstance = {
  update: vi.fn(),
}

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function() {
    return mockEyeControllerInstance;
  }),
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

  it('initializes controllers correctly', () => {
    render(<CharacterRenderer actor={mockActor} />)

    expect(CharacterAnimator).toHaveBeenCalled()
    expect(BoneController).toHaveBeenCalled()
  })

  it('calls boneController.setPose when bodyPose changes', () => {
    const { rerender } = render(<CharacterRenderer actor={mockActor} />)

    const newPose = { head: [0.1, 0.2, 0.3] } as any
    rerender(<CharacterRenderer actor={{ ...mockActor, bodyPose: newPose }} />)

    expect(mockBoneControllerInstance.setPose).toHaveBeenCalledWith(newPose)
  })
})
