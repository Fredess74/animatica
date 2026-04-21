import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn((val) => ({ current: val ?? null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
    // We don't strictly need to mock memo/forwardRef if we want to test the real ones,
    // but the test currently relies on accessing .type.render
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock internal character modules to avoid errors during direct function invocation
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
  createDanceClip: vi.fn(),
  createIdleClip: vi.fn(),
  createJumpClip: vi.fn(),
  createRunClip: vi.fn(),
  createSitClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWalkClip: vi.fn(),
  createWaveClip: vi.fn(),
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    setImmediate: vi.fn(),
    update: vi.fn(),
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({})),
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

  it('renders a group containing rig root with correct transform', () => {
    // Call the forwardRef component's render function directly
    // Since it's wrapped in memo, we access the underlying forwardRef via .type
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the primitive rig root
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')

    const rigPrimitiveProps = rigPrimitive.props as any
    expect(rigPrimitiveProps.object).toBeDefined()
    expect(rigPrimitiveProps.object).toBeInstanceOf(THREE.Object3D)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection indicator mesh
    const selectionIndicator = children[1]
    expect(selectionIndicator.type).toBe('mesh')

    const meshChildren = React.Children.toArray(selectionIndicator.props.children) as React.ReactElement[]
    expect(meshChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
