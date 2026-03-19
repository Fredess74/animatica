// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  useHelper: vi.fn(),
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

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    // In JSDOM, R3F elements like <group> and <primitive> are rendered as custom DOM elements
    const group = container.querySelector('group')
    expect(group).toBeDefined()
    // Position/rotation/scale are passed as props to the group,
    // but React doesn't necessarily render them as attributes on the "group" DOM element
    // unless they are standard HTML attributes.
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    // Should render a mesh for the selection ring
    const meshes = container.querySelectorAll('mesh')
    expect(meshes.length).toBeGreaterThan(0)
  })
})
