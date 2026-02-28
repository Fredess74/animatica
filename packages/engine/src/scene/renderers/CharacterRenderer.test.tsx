import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial || null }),
    useMemo: (factory: () => any) => factory(),
    useEffect: vi.fn(),
    useCallback: (fn: any) => fn,
    useImperativeHandle: vi.fn((ref, factory) => {
        if (typeof ref === 'function') {
            ref(factory());
        } else if (ref) {
            // @ts-ignore
            ref.current = factory();
        }
    }),
    useContext: vi.fn(),
    useReducer: (_reducer: any, initial: any) => [initial, vi.fn()],
    useState: (initial: any) => [initial, vi.fn()],
    useLayoutEffect: vi.fn(),
    useDebugValue: vi.fn(),
  }
})

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock the internal character modules that use THREE
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    skeleton: null,
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
    setImmediate: vi.fn(),
    update: vi.fn(),
  })),
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn(() => ({
    update: vi.fn(() => ({})),
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

  it('renders a group containing the rig root via primitive', () => {
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

    // First child should be the primitive object (rig root)
    const rigPrimitive = children[0] as React.ReactElement<any>
    expect(rigPrimitive.type).toBe('primitive')
    expect(rigPrimitive.props.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement

    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1] as React.ReactElement<any>
    expect(selectionRing.type).toBe('mesh')
    const ringProps = selectionRing.props
    expect(ringProps.children).toBeDefined()

    const ringChildren = React.Children.toArray(ringProps.children) as React.ReactElement[]
    expect(ringChildren.some(c => (c as React.ReactElement).type === 'ringGeometry')).toBe(true)
  })
})
