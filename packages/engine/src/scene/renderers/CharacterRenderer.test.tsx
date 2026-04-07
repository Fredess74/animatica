// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock the dependencies
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: () => ({
    root: { type: 'Group' },
    bodyMesh: {},
    morphTargetMap: {}
  })
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: class {
    registerClip = vi.fn()
    play = vi.fn()
    dispose = vi.fn()
    update = vi.fn()
    setSpeed = vi.fn()
  },
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
  createRunClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWaveClip: vi.fn(),
  createDanceClip: vi.fn(),
  createSitClip: vi.fn(),
  createJumpClip: vi.fn(),
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: class {
    update = vi.fn()
    setTarget = vi.fn()
    setImmediate = vi.fn()
  }
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: class {
    update = vi.fn()
  }
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn().mockReturnValue({
    body: { skinColor: '#D4A27C', height: 1, build: 0.5 }
  })
}))

// Mock R3F useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
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
    const group = container.firstChild as HTMLElement

    // In JSDOM, R3F elements render as lowercase tags
    expect(group.tagName).toBe('GROUP')
    // Transform props are passed to the element in JSDOM
    expect(group.getAttribute('position')).toBe('10,0,5')
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator ring when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    // The ring is a mesh child of the group
    const group = container.firstChild as HTMLElement
    const ring = Array.from(group.children).find(c => c.tagName === 'MESH')
    expect(ring).toBeDefined()
  })

  it('forwards ref', () => {
    const ref = React.createRef<any>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).toBeDefined()
  })
})
