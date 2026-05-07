import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')

  class MockGroup {
    add = vi.fn()
    remove = vi.fn()
    children = []
    position = { set: vi.fn() }
    rotation = { set: vi.fn() }
    scale = { set: vi.fn() }
    name = ''
    matrixWorld = { setFromMatrixPosition: vi.fn() }
  }

  return {
    ...actual,
    Group: MockGroup,
    Vector3: actual.Vector3,
    Color: actual.Color,
    DoubleSide: actual.DoubleSide,
  }
})

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useEffect: vi.fn(),
    useMemo: vi.fn((factory) => factory()),
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock dependencies
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'mock-root' },
    bodyMesh: null,
    morphTargetMap: {},
  })),
}))

vi.mock('../../character/CharacterAnimator', () => {
  class MockAnimator {
    registerClip = vi.fn()
    play = vi.fn()
    setSpeed = vi.fn()
    update = vi.fn()
    dispose = vi.fn()
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

vi.mock('../../character/FaceMorphController', () => {
  class MockFaceMorphController {
    setTarget = vi.fn()
    update = vi.fn()
    setImmediate = vi.fn()
  }
  return {
    FaceMorphController: MockFaceMorphController,
  }
})

vi.mock('../../character/EyeController', () => {
  class MockEyeController {
    update = vi.fn()
  }
  return {
    EyeController: MockEyeController,
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
    vi.clearAllMocks()
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

  it('renders a group with correct transform and primitive rig', () => {
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should contain a primitive with the rig root
    const primitive = children.find(c => c.type === 'primitive')
    expect(primitive).toBeDefined()
    expect(primitive?.props.object).toEqual({ name: 'mock-root' })
  })

  it('renders with visible prop correctly', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: invisibleActor }) as React.ReactElement
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const selectionMesh = children.find(c => c.type === 'mesh')
    expect(selectionMesh).toBeDefined()

    const meshChildren = React.Children.toArray(selectionMesh?.props.children) as React.ReactElement[]
    expect(meshChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
