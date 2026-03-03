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
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
    useImperativeHandle: vi.fn((ref, factory) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(factory())
        } else {
          ref.current = factory()
        }
      }
    }),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock internal modules to avoid complex rig creation in tests
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: [],
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn(() => ({
    setTarget: vi.fn(),
    update: vi.fn(),
    setImmediate: vi.fn(),
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn(() => ({
    update: vi.fn(),
  })),
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(),
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
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should contain a primitive for the rig
    const primitive = children.find((child: any) => child.type === 'primitive')
    expect(primitive).toBeDefined()
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

    // Should contain a mesh for selection ring
    const selectionMesh = children.find((child: any) => child.type === 'mesh')
    expect(selectionMesh).toBeDefined()

    const meshChildren = React.Children.toArray((selectionMesh as any).props.children) as React.ReactElement[]
    expect(meshChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
