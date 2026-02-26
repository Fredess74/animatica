import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react hooks used in the component
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    memo: (comp: any) => comp,
    forwardRef: (comp: any) => ({
        $$typeof: Symbol.for('react.forward_ref'),
        render: comp
    }),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock character loader and other modules
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: []
  }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn()
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
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
    // Access the render function of the forwardRef component
    const renderFunc = (CharacterRenderer as any).render
    const result = renderFunc({ actor: mockActor }, null)

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const renderFunc = (CharacterRenderer as any).render

    // In our implementation, we return <group visible={false} ...>
    // So we check if visible prop is false
    const result = renderFunc({ actor: invisibleActor }, null)
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
    const renderFunc = (CharacterRenderer as any).render
    const result = renderFunc({ actor: mockActor, isSelected: true }, null)

    const children = React.Children.toArray(result.props.children)
    // Check if there is a mesh (the indicator ring)
    const ringMesh = children.find((c: any) => c.type === 'mesh')
    expect(ringMesh).toBeDefined()
  })
})
