/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isGroup: true, add: vi.fn(), remove: vi.fn(), children: [] },
    bodyMesh: { morphTargetDictionary: {}, morphTargetInfluences: [] },
    bones: new Map(),
    morphTargetMap: {},
    animations: [],
  })),
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => {
  const CharacterAnimatorMock = vi.fn().mockImplementation(function(this: any) {
    this.registerClip = vi.fn();
    this.play = vi.fn();
    this.setSpeed = vi.fn();
    this.update = vi.fn();
    this.dispose = vi.fn();
    return this;
  });

  return {
    CharacterAnimator: CharacterAnimatorMock,
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
  };
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

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a group with correct transform props when visible is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')

    // Position/Rotation/Scale are passed as objects/arrays to R3F,
    // which jsdom renders as comma-separated strings
    expect(group?.getAttribute('position')).toBe('10,0,5')
    expect(group?.getAttribute('rotation')).toBe('0,3.141592653589793,0')
    expect(group?.getAttribute('scale')).toBe('1,1,1')
  })

  it('renders selection ring when isSelected is true', () => {
    const { getByTestId } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    const ring = getByTestId('selection-ring')
    expect(ring).not.toBeNull()

    // Verify ring styling
    const material = ring.querySelector('meshbasicmaterial')
    expect(material?.getAttribute('color')).toBe('#22C55E')
  })

  it('does not render selection ring when isSelected is false', () => {
    const { queryByTestId } = render(
      <CharacterRenderer actor={mockActor} isSelected={false} />
    )
    expect(queryByTestId('selection-ring')).toBeNull()
  })
})
