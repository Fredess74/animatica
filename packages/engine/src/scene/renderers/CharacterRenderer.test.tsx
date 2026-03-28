/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: {
        name: 'rig-root',
        position: { set: vi.fn() },
        rotation: { set: vi.fn() },
        scale: { set: vi.fn() },
    },
    bodyMesh: { name: 'body-mesh' },
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      setSpeed: vi.fn(),
      update: vi.fn(),
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
      update: vi.fn(() => ({})),
    }
  }),
}))

vi.mock('../../character/BoneController', () => ({
  BoneController: vi.fn().mockImplementation(function() {
    return {
      update: vi.fn(),
    }
  }),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 },
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
      scale: [1, 1, 1],
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {},
  }

  it('renders a group with correct actor ID as name', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )

    // R3F elements are rendered as lowercase tag names in JSDOM
    const group = container.querySelector('group')
    expect(group).toBeTruthy()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('does not render when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(
      <CharacterRenderer actor={invisibleActor} />
    )

    const group = container.querySelector('group')
    expect(group).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )

    // Look for the mesh that represents the selection ring
    const mesh = container.querySelector('mesh')
    expect(mesh).toBeTruthy()
  })
})
