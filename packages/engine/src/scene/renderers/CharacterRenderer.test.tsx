import { describe, it, expect, vi } from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock character logic to avoid heavy processing
vi.mock('../../character/CharacterLoader', () => {
  const mockGroup = {
    type: 'Group',
    isObject3D: true,
    position: { set: vi.fn() },
    rotation: { set: vi.fn() },
    scale: { set: vi.fn() },
    children: [],
    add: vi.fn(),
    remove: vi.fn(),
    removeFromParent: vi.fn(),
    dispatchEvent: vi.fn(),
    traverse: vi.fn(),
  };
  return {
    createProceduralHumanoid: vi.fn().mockReturnValue({
      root: mockGroup,
      bodyMesh: { ...mockGroup, type: 'Mesh', morphTargetInfluences: [] },
      morphTargetMap: {}
    })
  };
})

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() {
    return {
        registerClip: vi.fn(),
        play: vi.fn(),
        update: vi.fn(),
        dispose: vi.fn(),
        setSpeed: vi.fn()
    };
  }),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
  createRunClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWaveClip: vi.fn(),
  createDanceClip: vi.fn(),
  createSitClip: vi.fn(),
  createJumpClip: vi.fn()
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(function() {
    return {
        update: vi.fn(),
        setTarget: vi.fn(),
        setImmediate: vi.fn()
    };
  })
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function() {
    return {
        update: vi.fn()
    };
  })
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

  it('renders a group with correct transform', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <CharacterRenderer actor={mockActor} />
    )

    const group = renderer.scene.children[0]
    expect(group.type).toBe('Group')

    // Check transform
    expect(group.props.position).toEqual([10, 0, 5])
    expect(group.props.rotation).toEqual([0, Math.PI, 0])
    expect(group.props.scale).toEqual([1, 1, 1])
  })

  it('renders nothing when visible is false', async () => {
    const invisibleActor = { ...mockActor, visible: false }
    const renderer = await ReactThreeTestRenderer.create(
      <CharacterRenderer actor={invisibleActor} />
    )

    const group = renderer.scene.children[0]
    expect(group.props.visible).toBe(false)
  })

  it('renders selection indicator ring when isSelected is true', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )

    const group = renderer.scene.children[0]
    // Group has children: rig.root (primitive) and selection ring (mesh)
    const selectionRing = group.children.find(c => c.type === 'Mesh')
    expect(selectionRing).toBeDefined()
  })
})
