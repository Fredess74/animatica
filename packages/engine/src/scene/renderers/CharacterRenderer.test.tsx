// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader and controllers
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group' },
    bodyMesh: {},
    morphTargetMap: {}
  })),
}))

vi.mock('../../character/CharacterAnimator', () => {
  const MockAnimator = vi.fn()
  MockAnimator.prototype.registerClip = vi.fn()
  MockAnimator.prototype.play = vi.fn()
  MockAnimator.prototype.dispose = vi.fn()
  MockAnimator.prototype.update = vi.fn()
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

vi.mock('../../character/FaceMorphController', () => {
  const MockController = vi.fn()
  MockController.prototype.update = vi.fn()
  MockController.prototype.setTarget = vi.fn()
  MockController.prototype.setImmediate = vi.fn()
  return { FaceMorphController: MockController }
})

vi.mock('../../character/EyeController', () => {
  const MockController = vi.fn()
  MockController.prototype.update = vi.fn()
  return { EyeController: MockController }
})

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
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )

    const group = container.querySelector('group')
    expect(group).toBeTruthy()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(
      <CharacterRenderer actor={invisibleActor} />
    )

    const group = container.querySelector('group')
    expect(group).toBeNull()
  })
})
