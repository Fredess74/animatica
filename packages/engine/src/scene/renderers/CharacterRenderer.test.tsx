import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to return forwardRef: (render) => ({ render, type: { render } }) and memo: (comp) => comp
// as suggested by project memory for inspecting component render output.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    forwardRef: (render: any) => ({ render, type: { render } }),
    memo: (comp: any) => comp,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useImperativeHandle: () => {},
    useCallback: (fn: any) => fn,
  }
})

// Mock @react-three/fiber for useFrame and useThree
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({
    gl: { domElement: {} },
    scene: {},
    camera: {}
  })
}))

// Mock internal modules used in CharacterRenderer
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { name: 'rig-root' },
    bodyMesh: {},
    morphTargetMap: {}
  }))
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
    setImmediate: vi.fn(),
    update: vi.fn(),
  }))
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn(() => ({})),
  }))
}))

vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => null)
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

    // Verify children contains rig root via primitive
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const rigPrimitive = children.find(child => child.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
    expect(((rigPrimitive as any).props).object.name).toBe('rig-root')
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    const selectionRing = children.find(child => child.type === 'mesh' && React.Children.toArray((child as any).props.children).some((c: any) => c.type === 'ringGeometry'))
    expect(selectionRing).toBeDefined()
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, onClick }, null) as React.ReactElement
    const props = result.props as any

    const stopPropagation = vi.fn()
    props.onClick({ stopPropagation })

    expect(stopPropagation).toHaveBeenCalled()
    expect(onClick).toHaveBeenCalled()
  })
})
