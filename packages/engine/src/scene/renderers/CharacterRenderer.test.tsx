import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((factory) => factory()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
    useImperativeHandle: vi.fn(),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock character loader/animator/etc.
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'root' },
    bodyMesh: { name: 'body' },
    morphTargetMap: {},
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

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => ({
    body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 },
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
      position: [10, 0, 5] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number]
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group with correct transform and rig', () => {
    // Access the underlying render function because of memo/forwardRef
    const result = (CharacterRenderer as any).type.render({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the primitive object (rig.root)
    const primitive = children[0] as React.ReactElement
    expect(primitive.type).toBe('primitive')
    const primitiveProps = primitive.props as any
    expect(primitiveProps.object).toEqual({ name: 'root' })
  })

  it('renders null when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = (CharacterRenderer as any).type.render({ actor: invisibleActor }, { current: null })
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const result = (CharacterRenderer as any).type.render({ actor: mockActor, isSelected: true }, { current: null }) as React.ReactElement
    const children = React.Children.toArray((result.props as any).children) as React.ReactElement[]

    // Second child should be the selection indicator mesh
    const selectionRing = children[1] as React.ReactElement
    expect(selectionRing.type).toBe('mesh')

    const selectionRingProps = selectionRing.props as any
    const ringChildren = React.Children.toArray(selectionRingProps.children) as React.ReactElement[]
    expect(ringChildren[0].type).toBe('ringGeometry')
    expect(ringChildren[1].type).toBe('meshBasicMaterial')
  })
})
