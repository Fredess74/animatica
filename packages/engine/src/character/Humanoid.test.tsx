/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { Humanoid } from './Humanoid'
import { CharacterActor } from '../types'
import * as THREE from 'three'

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb) => cb()),
}))

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({
    scene: new THREE.Group(),
    animations: [],
  })),
  useAnimations: vi.fn(() => ({
    actions: {},
  })),
}))

describe('Humanoid', () => {
  const mockActor: CharacterActor = {
    id: '1',
    name: 'Test Actor',
    type: 'character',
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    visible: true,
    animation: 'idle',
    morphTargets: {},
    bodyPose: {
      head: [0.1, 0, 0],
    },
    clothing: {},
  }

  it('renders without crashing when URL is provided', () => {
    const { container } = render(
      <Humanoid url="test.glb" actor={mockActor} />
    )
    expect(container).toBeDefined()
  })

  it('renders without crashing when URL is missing (fallback)', () => {
    const { container } = render(<Humanoid actor={mockActor} />)
    expect(container).toBeDefined()
  })
})
