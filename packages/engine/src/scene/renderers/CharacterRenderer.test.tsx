import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as THREE from 'three'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock character rig creation
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn().mockReturnValue({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: {},
  }),
}))

// Mock Character components
vi.mock('../../character/CharacterAnimator', () => {
  return {
    CharacterAnimator: vi.fn().mockImplementation(function() {
      return {
        registerClip: vi.fn(),
        play: vi.fn(),
        dispose: vi.fn(),
        update: vi.fn(),
        setSpeed: vi.fn(),
      }
    }),
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
  }
})

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(function() {
    return {
      setTarget: vi.fn(),
      update: vi.fn(),
      setImmediate: vi.fn(),
    }
  }),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function() {
    return {
      update: vi.fn().mockReturnValue({}),
    }
  }),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
}))

describe('CharacterRenderer', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with transform props', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <CharacterRenderer actor={mockActor} />
    )

    const scene = renderer.scene
    const group = scene.children[0]

    expect(group.allChildren).toBeDefined()
    expect(group.props.position).toEqual([10, 0, 5])
    expect(group.props.rotation).toEqual([0, Math.PI, 0])
    expect(group.props.scale).toEqual([1, 1, 1])
  })

  it('honors visible prop', async () => {
    const invisibleActor = { ...mockActor, visible: false }
    const renderer = await ReactThreeTestRenderer.create(
      <CharacterRenderer actor={invisibleActor} />
    )

    const group = renderer.scene.children[0]
    expect(group.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )

    const group = renderer.scene.children[0]
    // Group should have rig (primitive) + selection ring (mesh)
    const ring = group.children.find(c => c.type === 'Mesh')
    expect(ring).toBeDefined()
  })
})
