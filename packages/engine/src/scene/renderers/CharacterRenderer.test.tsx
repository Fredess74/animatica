/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    Vector3: class extends actual.Vector3 {
      setFromMatrixPosition() { return this }
    },
    Group: class extends actual.Group {},
    Object3D: class extends actual.Object3D {},
    SkinnedMesh: class extends actual.SkinnedMesh {},
  }
})

// Mock the CharacterLoader and controllers
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root', traverse: vi.fn() },
    bodyMesh: { morphTargetInfluences: [] },
    morphTargetMap: {},
    animations: []
  }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(function() {
    return {
      registerClip: vi.fn(),
      play: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
      setSpeed: vi.fn()
    }
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
      setTarget: vi.fn(),
      setImmediate: vi.fn(),
      update: vi.fn()
    }
  })
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(function() {
    return {
      update: vi.fn(() => ({}))
    }
  })
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => null)
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
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

  it('renders a group with correct transform', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')

    expect(group).not.toBeNull()
    // In JSDOM with R3F components rendered as HTML tags
    expect(group?.getAttribute('position')).toBe('10,0,5')
    expect(group?.getAttribute('rotation')).toBe(`0,${Math.PI},0`)
    expect(group?.getAttribute('scale')).toBe('1,1,1')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    const mesh = container.querySelectorAll('mesh')
    // One for the selection ring (indicator)
    expect(mesh.length).toBeGreaterThan(0)
  })

  it('forwards ref to the root group', () => {
    const ref = React.createRef<any>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).toBeDefined()
    // It will be an HTML element with tagName GROUP in this mocked environment
    expect(ref.current.tagName).toBe('GROUP')
  })
})
