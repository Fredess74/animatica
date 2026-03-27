import { describe, it, expect, vi, afterEach } from 'vitest'
import * as THREE from 'three'
import { render } from '@testing-library/react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock components and hooks that depend on R3F context
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => {
    const root = new THREE.Group()
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshStandardMaterial({ color: '#ff00aa' }))
    head.name = 'Head'
    root.add(head)
    return {
      root,
      bodyMesh: null,
      skeleton: null,
      bones: new Map(),
      morphTargetMap: {},
      animations: [],
    }
  })
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

  it('renders a group with correct transform and rig components', () => {
    const { container } = render(
        <CharacterRenderer actor={mockActor} />
    )

    const group = container.querySelector('group')
    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')

    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })
})
