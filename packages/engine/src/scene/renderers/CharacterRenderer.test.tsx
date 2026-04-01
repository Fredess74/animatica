// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
  useThree: () => ({ gl: { domElement: {} } }),
}))

vi.mock('@react-three/drei', () => ({
  Edges: () => <div data-testid="edges" />
}))

// Mock the CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root', type: 'Object3D', position: { set: vi.fn() }, rotation: { set: vi.fn() }, scale: { set: vi.fn() } },
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: [],
  })),
}))

// Mock the CharacterAnimator and controllers
vi.mock('../../character/CharacterAnimator', () => {
  const MockAnimator = function() {
    this.registerClip = vi.fn();
    this.play = vi.fn();
    this.setSpeed = vi.fn();
    this.update = vi.fn();
    this.dispose = vi.fn();
  }
  return {
    CharacterAnimator: MockAnimator,
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

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: function() {
    this.setTarget = vi.fn();
    this.update = vi.fn();
    this.setImmediate = vi.fn();
  },
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: function() {
    this.update = vi.fn().mockReturnValue({});
  },
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

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).toBeTruthy()
    // In JSDOM, properties are often stringified or stored in attributes
    expect(group?.getAttribute('position')).toBe('10,0,5')
  })

  it('renders nothing (null) when visible is false', () => {
    const { container } = render(<CharacterRenderer actor={{ ...mockActor, visible: false }} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { getByTestId } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const selectionRing = getByTestId('selection-ring')
    expect(selectionRing).toBeTruthy()
  })

  it('forwards ref to the group', () => {
    const ref = React.createRef<THREE.Group>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).toBeDefined()
    expect((ref.current as any).tagName).toBe('GROUP')
  })
})
