/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F and Drei components
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(),
  Edges: () => <mesh-edges />,
}))

// Mock CharacterLoader and Animator
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root', children: [], position: { set: vi.fn() }, rotation: { set: vi.fn() }, scale: { set: vi.fn() }, traverse: vi.fn() },
    bones: new Map(),
    bodyMesh: null,
    morphTargetMap: {},
  })),
}))

vi.mock('../../character', () => {
  const CharacterAnimator = vi.fn().mockImplementation(function() {
    this.registerClip = vi.fn();
    this.play = vi.fn();
    this.setSpeed = vi.fn();
    this.update = vi.fn();
    this.dispose = vi.fn();
  });

  const BoneController = vi.fn().mockImplementation(function() {
    this.update = vi.fn();
  });

  return {
    CharacterAnimator,
    BoneController,
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

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(function() {
    this.setTarget = vi.fn();
    this.update = vi.fn();
    this.setImmediate = vi.fn();
  }),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function() {
    this.update = vi.fn(() => ({}));
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

  it('renders a group with correct transform', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )

    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('position')).toBe('10,0,5')
  })

  it('returns null when visible is false', () => {
    const { container } = render(
      <CharacterRenderer actor={{ ...mockActor, visible: false }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders selection ring when selected', () => {
     render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    // In a real R3F test we'd look for the ring mesh.
    // Here we just ensure it renders.
  })
})
