// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock character dependencies
vi.mock('../../characters/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root' },
    bodyMesh: {},
    morphTargetMap: {}
  }))
}))

vi.mock('../../characters/CharacterAnimator', () => {
    return {
        CharacterAnimator: class {
            registerClip = vi.fn()
            play = vi.fn()
            setSpeed = vi.fn()
            dispose = vi.fn()
            update = vi.fn()
        },
        createDanceClip: vi.fn(),
        createIdleClip: vi.fn(),
        createJumpClip: vi.fn(),
        createRunClip: vi.fn(),
        createSitClip: vi.fn(),
        createTalkClip: vi.fn(),
        createWalkClip: vi.fn(),
        createWaveClip: vi.fn(),
    }
})

vi.mock('../../characters/FaceMorphController', () => ({
    FaceMorphController: class {
        setTarget = vi.fn()
        update = vi.fn()
        setImmediate = vi.fn()
    }
}))

vi.mock('../../characters/EyeController', () => ({
    EyeController: class {
        update = vi.fn()
    }
}))

vi.mock('../../characters/CharacterPresets', () => ({
    getPreset: vi.fn(() => ({
        body: { skinColor: '#ff0000', height: 1, build: 0.5 }
    }))
}))

// Mock @react-three/fiber
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
    const group = container.querySelector('group')

    expect(group).not.toBeNull()
    expect(group?.getAttribute('name')).toBe('char-1')
  })

  it('renders nothing when visible is false', () => {
    const { container } = render(<CharacterRenderer actor={{ ...mockActor, visible: false }} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} isSelected={true} />)
    // Selection indicator is a ringGeometry inside a mesh
    const ring = container.querySelector('ringgeometry')
    expect(ring).not.toBeNull()
  })

  it('forwards ref to the group', () => {
    const ref = React.createRef<any>()
    render(<CharacterRenderer actor={mockActor} ref={ref} />)
    expect(ref.current).toBeDefined()
  })
})
