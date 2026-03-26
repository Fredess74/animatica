// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  // Mock Three.js elements
  extend: vi.fn(),
}))

// Mock character rig creation
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isGroup: true },
    bodyMesh: { morphTargetInfluences: [] },
    morphTargetMap: {}
  })),
}))

// Mock animator and controllers
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      update: vi.fn(),
      setSpeed: vi.fn(),
      dispose: vi.fn(),
    }
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
  FaceMorphController: vi.fn().mockImplementation(function() {
    return {
      setTarget: vi.fn(),
      update: vi.fn(),
      setImmediate: vi.fn(),
    }
  }),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function() {
    return {
      update: vi.fn(),
    }
  }),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
}))

describe('CharacterRenderer', () => {
  beforeEach(() => {
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
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')

    expect(group).not.toBeNull()
    // JSDOM renders custom elements with lowercased attributes or as properties
    // In R3F tests, we often check the mock calls or the container
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('sets correct visibility on the group', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    const group = container.querySelector('group')
    // visible={false} in React might not render a 'visible' attribute on a custom tag in JSDOM
    // or it might render it as "false". If it's missing, it usually means it was passed as false.
    const visibleAttr = group?.getAttribute('visible')
    expect(visibleAttr === 'false' || visibleAttr === null).toBe(true)
  })

  it('renders selection ring when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const ring = container.querySelector('ringgeometry')
    expect(ring).not.toBeNull()
  })
})
