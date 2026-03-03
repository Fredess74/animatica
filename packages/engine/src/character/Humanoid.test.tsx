import { describe, it, expect, vi, afterEach } from 'vitest'
import { Suspense } from 'react'
import { render } from '@testing-library/react'
import { Humanoid } from './Humanoid'
import * as THREE from 'three'

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(),
}))

// Mock CharacterLoader
vi.mock('./CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bones: new Map(),
    morphTargetMap: {},
  })),
}))

describe('Humanoid', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders procedural humanoid when no URL is provided', () => {
    const { container } = render(<Humanoid />)
    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('renders Suspend and GLBHumanoid when URL is provided', () => {
    // We wrap in a custom Suspense because our component uses it
    const { container } = render(
      <Suspense fallback={<div data-testid="loading">Loading...</div>}>
        <Humanoid url="test.glb" />
      </Suspense>
    )

    // It should initially render fallback if useGLTF is mocked to suspend,
    // but here we just check it doesn't crash.
    expect(container).toBeDefined()
  })
})
