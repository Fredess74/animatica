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
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
    forwardRef: (render: any) => ({ render, $$typeof: Symbol.for('react.forward_ref') }),
    memo: (type: any) => ({ type, $$typeof: Symbol.for('react.memo') }),
  }
})

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
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

  it('renders a group containing correct transform', () => {
    // Call the forwardRef component's render function directly
    // Since it's wrapped in memo, we access the underlying forwardRef via .type
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

    // First child should be the character rig (primitive)
    const rig = children[0]
    expect(rig.type).toBe('primitive')

    const rigProps = rig.props as any
    expect(rigProps.object).toBeDefined()
  })

  it('renders with visible false when actor is hidden', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null) as any
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as any
    const props = result.props
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection indicator ring
    const selectionIndicator = children[1] as any
    expect(selectionIndicator.type).toBe('mesh')
    const meshChildren = React.Children.toArray(selectionIndicator.props.children) as React.ReactElement[]
    expect(meshChildren.some(child => child.type === 'ringGeometry')).toBe(true)
  })
})
