// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => <div data-testid="edges" />,
  ringGeometry: (props: any) => <ringGeometry {...props} />,
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root', add: vi.fn(), children: [], position: { set: vi.fn() } },
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: [],
  }))
}))

// Mock react-three-fiber
vi.mock('@react-three/fiber', async () => {
    const actual = await vi.importActual<typeof import('@react-three/fiber')>('@react-three/fiber')
    return {
        ...actual,
        useFrame: vi.fn(),
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

  it('renders a group containing character rig with correct transform', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} />
    )

    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    // In jsdom/react testing library, group properties might be lowercase
    expect(group?.getAttribute('position')).toBe('10,0,5')
    expect(group?.getAttribute('rotation')).toBe(`0,${Math.PI},0`)
    expect(group?.getAttribute('scale')).toBe('1,1,1')

    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(
      <CharacterRenderer actor={invisibleActor} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const { container } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )

    const ring = container.querySelector('ringGeometry')
    expect(ring).not.toBeNull()
  })
})
