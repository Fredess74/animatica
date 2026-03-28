// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock THREE classes
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')

  function MockAnimationMixer() {
    return {
      clipAction: vi.fn(() => ({
        setEffectiveWeight: vi.fn().mockReturnThis(),
        setEffectiveTimeScale: vi.fn().mockReturnThis(),
        play: vi.fn().mockReturnThis(),
        reset: vi.fn().mockReturnThis(),
        crossFadeTo: vi.fn().mockReturnThis(),
      })),
      update: vi.fn(),
      stopAllAction: vi.fn(),
    };
  }

  return {
    ...actual,
    AnimationMixer: MockAnimationMixer,
    Vector3: class extends actual.Vector3 {
        setFromMatrixPosition = vi.fn().mockReturnThis()
    }
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Character components
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: [],
  })),
}))

vi.mock('../../character/CharacterAnimator', () => {
  function MockCharacterAnimator() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      setSpeed: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    };
  }

  return {
    CharacterAnimator: MockCharacterAnimator,
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
  };
})

vi.mock('../../character/FaceMorphController', () => {
  function MockFaceMorphController() {
    return {
      setTarget: vi.fn(),
      update: vi.fn(),
      setImmediate: vi.fn(),
    };
  }

  return {
    FaceMorphController: MockFaceMorphController,
  };
})

vi.mock('../../character/EyeController', () => {
  function MockEyeController() {
    return {
      update: vi.fn(() => ({})),
    };
  }

  return {
    EyeController: MockEyeController,
  };
})

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

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()

    // In JSDOM, custom R3F elements are rendered as lowercase tag names
    // We check their attributes which correspond to props
    expect(group?.getAttribute('position')).toBe('10,0,5')
    // rotation is [0, 3.141592653589793, 0]
    const rotationAttr = group?.getAttribute('rotation');
    expect(rotationAttr).toBeDefined();
    const rots = rotationAttr?.split(',').map(Number);
    expect(rots?.[1]).toBeCloseTo(Math.PI);
    expect(group?.getAttribute('scale')).toBe('1,1,1')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    // Selection indicator is a mesh
    const mesh = container.querySelector('mesh')
    expect(mesh).not.toBeNull()

    const ringGeo = container.querySelector('ringGeometry')
    expect(ringGeo).not.toBeNull()
    expect(ringGeo?.getAttribute('args')).toBe('0.4,0.5,32')
  })

  it('forwards ref', () => {
    const ref = React.createRef<THREE.Group>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).not.toBeNull()
    // In JSDOM, it will be a 'GROUP' tag
    expect((ref.current as any).tagName).toMatch(/GROUP/i)
  })
})
