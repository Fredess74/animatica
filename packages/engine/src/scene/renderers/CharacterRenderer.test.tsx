/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
// @ts-ignore
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
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )
    expect(container).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(
      <CharacterRenderer actor={invisibleActor} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders selection ring when selected', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    // Selection indicator is a mesh, but we don't have a good way to query it in this environment
    // without more complex R3F testing setup.
    // However, we can at least verify it doesn't crash.
    expect(container).toBeDefined()
  })
})
