/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock Three.js
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  return {
    ...actual,
    Vector3: class extends actual.Vector3 {
      setFromMatrixPosition() { return this }
    }
  }
})

// Mock R3F useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock internal controllers and loaders
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => {
    function Mock(this: any) {
        this.registerClip = vi.fn();
        this.play = vi.fn();
        this.setSpeed = vi.fn();
        this.update = vi.fn();
        this.dispose = vi.fn();
    }
    return {
        CharacterAnimator: Mock,
        createIdleClip: vi.fn(),
        createWalkClip: vi.fn(),
        createRunClip: vi.fn(),
        createTalkClip: vi.fn(),
        createWaveClip: vi.fn(),
        createDanceClip: vi.fn(),
        createSitClip: vi.fn(),
        createJumpClip: vi.fn(),
    }
})

vi.mock('../../character/FaceMorphController', () => {
    function Mock(this: any) {
        this.setTarget = vi.fn();
        this.update = vi.fn();
        this.setImmediate = vi.fn();
    }
    return {
        FaceMorphController: Mock,
    }
})

vi.mock('../../character/EyeController', () => {
    function Mock(this: any) {
        this.update = vi.fn(() => ({}));
    }
    return {
        EyeController: Mock,
    }
})

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: {
      skinColor: '#D4A27C',
      height: 1.0,
      build: 0.5,
    },
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
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { getByTestId } = render(
      <CharacterRenderer actor={mockActor} isSelected={true} />
    )
    expect(getByTestId('selection-ring')).toBeDefined()
  })

  it('does not render selection indicator when isSelected is false', () => {
    const { queryByTestId } = render(
      <CharacterRenderer actor={mockActor} isSelected={false} />
    )
    expect(queryByTestId('selection-ring')).toBeNull()
  })
})
