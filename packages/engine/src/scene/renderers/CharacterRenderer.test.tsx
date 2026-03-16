/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock @react-three/fiber's useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null,
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
      scale: [1, 1, 1]
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group with correct transform and primitive rig', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)

    const group = container.querySelector('group')
    expect(group).not.toBeNull()

    // In JSDOM, attributes are strings
    expect(group?.getAttribute('position')).toBe('10,0,5')
    expect(group?.getAttribute('rotation')).toBe('0,3.141592653589793,0')
    expect(group?.getAttribute('scale')).toBe('1,1,1')

    // Verify it contains a primitive for the rig
    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)

    // The selection indicator is a mesh with a ringGeometry
    const meshes = container.querySelectorAll('mesh')
    expect(meshes.length).toBe(1)

    const ringGeo = container.querySelector('ringgeometry')
    expect(ringGeo).not.toBeNull()
    expect(ringGeo?.getAttribute('args')).toBe('0.4,0.5,32')
  })

  it('forwards ref to the group', () => {
    const ref = React.createRef<THREE.Group>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).not.toBeNull()
    // @ts-ignore
    expect(ref.current.tagName).toBe('GROUP')
  })
})
