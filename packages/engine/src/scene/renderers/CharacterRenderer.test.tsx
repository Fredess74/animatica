import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
    useImperativeHandle: (ref: any, fn: any) => {
      if (ref) ref.current = fn()
    },
    memo: (comp: any) => comp,
    forwardRef: (comp: any) => ({ type: { render: comp } }),
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
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

  it('renders a group containing character rig with correct transform', () => {
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

    // First child should be the rig primitive
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect((rigPrimitive.props as any).object).toBeDefined()
  })

  it('returns null and skips render when visible is false', () => {
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

    // Selection indicator should be a mesh with ringGeometry
    const selectionIndicator = children.find(child =>
        (child as any).type === 'mesh' &&
        React.Children.toArray((child as any).props.children).some((c: any) => c.type === 'ringGeometry')
    )
    expect(selectionIndicator).toBeDefined()
  })
})
