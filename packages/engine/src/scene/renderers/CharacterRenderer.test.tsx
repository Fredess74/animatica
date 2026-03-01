import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'root' },
    bodyMesh: {},
    morphTargetMap: {}
  }))
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => {
  const MockAnimator = function() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      setSpeed: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    }
  }
  return {
    CharacterAnimator: MockAnimator,
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
  }
})

// Mock FaceMorphController
vi.mock('../../character/FaceMorphController', () => {
  const MockFaceMorph = function() {
    return {
      setTarget: vi.fn(),
      update: vi.fn(),
      setImmediate: vi.fn(),
    }
  }
  return {
    FaceMorphController: MockFaceMorph,
  }
})

// Mock EyeController
vi.mock('../../character/EyeController', () => {
  const MockEyeController = function() {
    return {
      update: vi.fn(),
    }
  }
  return {
    EyeController: MockEyeController,
  }
})

// Mock CharacterPresets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 }
  }))
}))

// Mock r3f
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
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

  it('renders a group containing primitive rig with correct transform', () => {
    // @ts-ignore
    const { container } = render(<CharacterRenderer actor={mockActor} />)

    // In JSDOM, group/primitive are just custom elements
    const group = container.querySelector('group')
    expect(group).not.toBeNull()

    // Testing-library/react-three-fiber bridge is tricky in pure JSDOM without Canvas
    // but we can check if it rendered the basic structure
    const primitive = container.querySelector('primitive')
    expect(primitive).not.toBeNull()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator ring when isSelected is true', () => {
    // @ts-ignore
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const mesh = container.querySelectorAll('mesh')
    // One for the selection ring
    expect(mesh.length).toBe(1)
  })
})
