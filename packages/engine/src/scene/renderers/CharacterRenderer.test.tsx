import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock internal character modules
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    dispose: vi.fn(),
    update: vi.fn(),
    setSpeed: vi.fn(),
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
    update: vi.fn(),
  })),
}))

// Mock CharacterPresets to avoid errors
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: {
      skinColor: '#D4A27C',
      height: 1.0,
      build: 0.5
    }
  })),
}))

// Mock engine store
vi.mock('../../store/sceneStore', () => ({
  useSceneStore: vi.fn(),
}))

// Standard React hook mocks for unit testing the render function
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (factory: () => any) => factory(),
    useEffect: vi.fn(),
    useCallback: (fn: any) => fn,
    useImperativeHandle: vi.fn(),
  }
})

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

  it('renders a group containing character rig with correct transform', () => {
    // CharacterRenderer is a memo(forwardRef) component.
    // In React 19, the structure is an object with a $$typeof and a render property.

    // @ts-ignore
    const renderFn = CharacterRenderer.type?.render || CharacterRenderer.render || CharacterRenderer
    const result = renderFn({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Rig should be present as a primitive
    const rigPrimitive = children.find(c => (c as any).type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('renders group with visible false when actor.visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const renderFn = CharacterRenderer.type?.render || CharacterRenderer.render || CharacterRenderer
    const result = renderFn({ actor: invisibleActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const renderFn = CharacterRenderer.type?.render || CharacterRenderer.render || CharacterRenderer
    const result = renderFn({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Look for the selection ring mesh
    const selectionRing = children.find(c => (c as any).type === 'mesh')
    expect(selectionRing).toBeDefined()
  })
})
