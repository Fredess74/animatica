import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
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
    Group: class {
      add = vi.fn()
      remove = vi.fn()
      position = { set: vi.fn() }
      rotation = { set: vi.fn() }
      scale = { set: vi.fn() }
    },
    Color: class {
      set = vi.fn()
    }
  }
})

// Mock the hooks and external dependencies
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useEffect: vi.fn(),
    useMemo: vi.fn((factory) => factory()),
  }
})

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group' },
    bodyMesh: {},
    morphTargetMap: {}
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
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
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn(),
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({})),
  })),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 }
  })),
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

  it('renders a group with correct transform', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement<any>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)
  })

  it('honors the visible prop', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement<any>
    expect(result.props.visible).toBe(false)
  })

  it('renders a primitive for the rig root', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement<any>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<any>[]

    const primitive = children.find(child => child.type === 'primitive')
    expect(primitive).toBeDefined()
    expect(primitive?.props.object).toEqual({ type: 'Group' })
  })

  it('renders a selection indicator ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement<any>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<any>[]

    const selectionRing = children.find(child => child && (child as any).type === 'mesh')
    expect(selectionRing).toBeDefined()

    const ringGeometry = React.Children.toArray((selectionRing as any).props.children).find(child => (child as any).type === 'ringGeometry')
    expect(ringGeometry).toBeDefined()
  })
})
