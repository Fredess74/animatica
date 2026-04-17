/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  useGLTF: () => ({ scene: { traverse: vi.fn() }, animations: [] }),
}))

// Mock Engine components
vi.mock('../../character/CharacterAnimator', () => {
  const MockAnimator = vi.fn()
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

vi.mock('../../character/FaceMorphController', () => {
  const MockController = vi.fn()
  MockController.prototype.setTarget = vi.fn()
  MockController.prototype.update = vi.fn()
  MockController.prototype.setImmediate = vi.fn()
  return { FaceMorphController: MockController }
})

vi.mock('../../character/EyeController', () => {
  const MockController = vi.fn()
  MockController.prototype.update = vi.fn().mockReturnValue({})
  return { EyeController: MockController }
})

describe('CharacterRenderer', () => {
  beforeEach(() => {
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

  it('renders a group with correct transform', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )

    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')
    expect(group?.getAttribute('position')).toBe('10,0,5')
  })

  it('renders selection ring when isSelected is true', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )

    const ring = container.querySelector('mesh ringgeometry')
    expect(ring).not.toBeNull()
  })
})
