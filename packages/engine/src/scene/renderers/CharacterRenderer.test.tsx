/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock THREE to avoid WebGL issues in jsdom
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      render: vi.fn(),
      setSize: vi.fn(),
      dispose: vi.fn(),
    })),
  }
})

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

  it('renders a group with correct name', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders the character rig (primitive object)', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('renders selection ring when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    // The selection ring is a mesh
    const meshes = container.querySelectorAll('mesh')
    expect(meshes.length).toBeGreaterThan(0)
  })
})
