import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial || null }),
    useMemo: (factory: () => any) => factory(),
    useEffect: vi.fn(),
    useImperativeHandle: vi.fn(),
    // Standard mock for forwardRef to allow inspection of the render function
    forwardRef: (render: any) => ({ render, type: { render } }),
    memo: (comp: any) => comp,
  }
})

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader to avoid THREE dependencies in unit test
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

// Mock CharacterPresets
vi.mock('../../character/CharacterPresets', () => ({
  getPreset: vi.fn(() => null),
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

  it('renders a group containing primitive rig with correct transform', () => {
    // Access the render function from the mocked forwardRef
    // @ts-ignore
    const render = CharacterRenderer.render || CharacterRenderer.type?.render
    const result = render({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Rig should be a primitive object
    const rigPrimitive = children.find(child => child.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
    expect((rigPrimitive?.props as any).object).toBeInstanceOf(THREE.Group)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const render = CharacterRenderer.render || CharacterRenderer.type?.render
    const result = render({ actor: invisibleActor }, { current: null })
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const render = CharacterRenderer.render || CharacterRenderer.type?.render
    const result = render({ actor: mockActor, isSelected: true }, { current: null }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    const selectionRing = children.find(child => (child.props as any)?.['data-testid'] === 'selection-ring')
    expect(selectionRing).toBeDefined()
    expect(selectionRing?.type).toBe('mesh')
  })
})
