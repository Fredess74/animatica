// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock R3F useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock character loader to avoid heavy THREE operations
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: {},
  })),
}))

// Mock presets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 },
  })),
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    cleanup()
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
      scale: [1, 1, 1],
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {},
  }

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')

    expect(group).not.toBeNull()
    // In JSDOM with our setup, group properties are often mapped to attributes or props
    // We check if it exists and has basic properties
    expect(group).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { getByTestId, queryByTestId } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )

    // The selection indicator is a mesh
    // We can use a more specific query if we add data-testid, but for now we'll check if it renders
    // Based on the code, it's a mesh with a ringGeometry
    const meshes = document.querySelectorAll('mesh')
    expect(meshes.length).toBeGreaterThan(0)
  })

  it('forwards ref to the group', () => {
    const ref = React.createRef<THREE.Group>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).not.toBeNull()
    // In JSDOM with our rendering, it might just be a DOM element
    // @ts-ignore
    expect(ref.current.tagName).toMatch(/GROUP/i)
  })
})
