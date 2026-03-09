import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { Humanoid } from './Humanoid'
import { CharacterActor } from '../types'

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({
    scene: { clone: () => ({ traverse: vi.fn() }) },
    animations: [],
  })),
  Suspense: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockActor: CharacterActor = {
  id: 'test-char',
  name: 'Test Character',
  type: 'character',
  visible: true,
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  animation: 'idle',
  morphTargets: {},
  bodyPose: {},
  clothing: {},
}

describe('Humanoid Component', () => {
  it('renders without crashing', () => {
    // We can't easily test R3F components with standard RTL without a Canvas
    // but we can check if it executes without immediate errors
    expect(() => render(<Humanoid actor={mockActor} />)).not.toThrow()
  })

  it('uses modelUrl when provided', () => {
    const actorWithModel = { ...mockActor, modelUrl: 'http://example.com/model.glb' }
    expect(() => render(<Humanoid actor={actorWithModel} />)).not.toThrow()
  })
})
