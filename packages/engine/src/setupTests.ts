import { vi } from 'vitest'
import React from 'react'

// Global mocks for Three.js and R3F
vi.mock('three', async () => {
  const actual = await vi.importActual('three')
  return {
    ...actual,
    AnimationMixer: vi.fn(() => ({
      clipAction: vi.fn(() => ({
        play: vi.fn(),
        stop: vi.fn(),
        setEffectiveWeight: vi.fn(),
        setEffectiveTimeScale: vi.fn(),
      })),
      update: vi.fn(),
      stopAllAction: vi.fn(),
    })),
  }
})

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    scene: { add: vi.fn(), remove: vi.fn() },
    camera: {},
    gl: {},
  })),
}))
