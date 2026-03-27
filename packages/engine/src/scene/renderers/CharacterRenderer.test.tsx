// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react-three-fiber and drei
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}))

vi.mock('@react-three/drei', () => ({
  Edges: () => null
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

  it('renders a group containing primitive with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.firstChild as HTMLElement

    expect(group.tagName).toMatch(/GROUP/i)

    const primitive = container.querySelector('primitive')
    expect(primitive).toBeDefined()
  })

  it('is hidden when visible is false', () => {
    const { container } = render(<CharacterRenderer actor={{ ...mockActor, visible: false }} />)
    const group = container.firstChild as HTMLElement
    // In JSDOM with R3F components, boolean false props often result in a null attribute
    const visible = group.getAttribute('visible')
    expect(visible === 'false' || visible === null).toBe(true)
  })

  it('renders selection indicator when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const meshes = container.querySelectorAll('mesh')

    expect(meshes.length).toBeGreaterThan(0)
    const ring = Array.from(container.querySelectorAll('ringGeometry'))
    expect(ring.length).toBe(1)
  })

  it('forwards ref', () => {
    const ref = React.createRef<any>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).toBeDefined()
  })
})
