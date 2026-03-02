import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: new THREE.Group() })),
    useMemo: vi.fn((factory) => factory()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
    useImperativeHandle: vi.fn((_ref, factory) => factory()),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock internal character modules
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: new Map()
  }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    update: vi.fn(),
    setSpeed: vi.fn(),
    dispose: vi.fn()
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn()
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    setImmediate: vi.fn(),
    update: vi.fn()
  }))
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({}))
  }))
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 }
  }))
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
    // Access the underlying render function from memo(forwardRef)
    // @ts-ignore
    const renderFn = (CharacterRenderer as any).type.render;
    const result = renderFn({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children contains rig primitive
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const rig = children.find(c => (c as React.ReactElement).type === 'primitive')
    expect(rig).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const renderFn = (CharacterRenderer as any).type.render;
    const result = renderFn({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const renderFn = (CharacterRenderer as any).type.render;
    const result = renderFn({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const ring = children.find(c => (c as React.ReactElement).type === 'mesh' && ((c as React.ReactElement).props as any)['data-testid'] === 'selection-ring')
    expect(ring).toBeDefined()
  })
})
