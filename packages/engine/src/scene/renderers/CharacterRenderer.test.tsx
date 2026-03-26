// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => <div data-testid="edges" />
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock character system to avoid 3D math and complex objects
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group' },
    bones: new Map(),
    bodyMesh: null,
    morphTargetMap: {},
    animations: [],
  }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
      setSpeed: vi.fn(),
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
      update: vi.fn(),
      setTarget: vi.fn(),
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

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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

  it('renders without crashing', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    expect(container).toBeDefined()
  })

  it('handles selection visibility', () => {
    const { getByTestId, queryByTestId } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    // The selection ring uses ringGeometry, not Edges/edges test id
    expect(getByTestId('selection-ring')).toBeDefined()

    cleanup()
    const { queryByTestId: queryAgain } = render(
      <CharacterRenderer actor={mockActor} isSelected={false} />
    )
    expect(queryAgain('edges')).toBeNull()
  })

  it('respects visibility prop', () => {
    const { container } = render(
        <CharacterRenderer actor={{ ...mockActor, visible: false }} />
    )
    expect(container.firstChild).toBeNull()
  })
})
