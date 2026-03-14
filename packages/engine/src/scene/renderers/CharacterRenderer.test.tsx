import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  const ReactMock = {
    ...actual,
    useRef: vi.fn(() => ({ current: { matrixWorld: { elements: [] } } })),
    useEffect: vi.fn(),
    useMemo: vi.fn((factory: any) => factory()),
    useCallback: vi.fn((callback: any) => callback),
    useImperativeHandle: vi.fn(),
    forwardRef: vi.fn((render: any) => ({ render, displayName: 'ForwardRef' })),
    memo: vi.fn((component: any) => ({ type: component })),
  }
  return {
    ...ReactMock,
    default: ReactMock,
  }
})

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterLoader to return a consistent rig
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isGroup: true, name: 'RigRoot' },
    bodyMesh: null,
    morphTargetMap: {}
  })),
}))

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
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
    // Call the forwardRef component's render function directly
    // CharacterRenderer is memo({ type: forwardRef({ render }) })
    // @ts-ignore
    const renderFn = CharacterRenderer.type.render
    const result = renderFn({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Rig should be rendered as a primitive
    const rigPrimitive = children.find(c => (c as any).type === 'primitive')
    expect(rigPrimitive).toBeDefined()
    expect((rigPrimitive?.props as any).object.name).toBe('RigRoot')
  })

  it('renders nothing when actor is not visible', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const renderFn = CharacterRenderer.type.render
    const result = renderFn({ actor: invisibleActor }, null) as React.ReactElement

    // In our implementation, visibility is handled via the visible prop on the group
    expect((result.props as any).visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
     // @ts-ignore
    const renderFn = CharacterRenderer.type.render
    const result = renderFn({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection indicator mesh
    const indicator = children.find(c => (c as any).type === 'mesh' && (c as any).props.rotation)
    expect(indicator).toBeDefined()
  })
})
