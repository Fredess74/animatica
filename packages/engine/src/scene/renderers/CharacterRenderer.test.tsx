// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Drei
vi.mock('@react-three/drei', () => ({
  Edges: () => <div data-testid="edges" />,
}))

describe('CharacterRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).toBeTruthy()
    // In JSDOM with R3F components being rendered as custom tags
    expect(group?.getAttribute('position')).toBe('10,0,5')
    expect(group?.getAttribute('rotation')).toBe('0,3.141592653589793,0')
  })

  it('renders rig and selection ring when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)

    // Check for rig primitive
    const primitive = container.querySelector('primitive')
    expect(primitive).toBeTruthy()

    // Check for selection ring mesh
    const meshes = container.querySelectorAll('mesh')
    const ringMesh = Array.from(meshes).find(m => m.querySelector('ringGeometry'))
    expect(ringMesh).toBeTruthy()

    const ringGeo = ringMesh?.querySelector('ringGeometry')
    expect(ringGeo?.getAttribute('args')).toBe('0.4,0.5,32')
  })

  it('does not render selection ring when not selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={false} />)
    const ringGeo = container.querySelector('ringGeometry')
    expect(ringGeo).toBeNull()
  })
})
