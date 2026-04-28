// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F and dependencies
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isGroup: true, children: [], position: { set: vi.fn() }, rotation: { set: vi.fn() }, scale: { set: vi.fn() } },
    bodyMesh: {},
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function(this: any) {
    this.registerClip = vi.fn();
    this.play = vi.fn();
    this.setSpeed = vi.fn();
    this.update = vi.fn();
    this.dispose = vi.fn();
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

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(function(this: any) {
    this.setTarget = vi.fn();
    this.update = vi.fn();
    this.setImmediate = vi.fn();
  }),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function(this: any) {
    this.update = vi.fn();
  }),
}))

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a group with correct name', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection ring when selected', () => {
    const { getByTestId } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    expect(getByTestId('selection-ring')).toBeDefined()
  })
})
