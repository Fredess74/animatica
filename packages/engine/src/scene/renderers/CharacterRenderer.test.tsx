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
    useRef: (initialValue: any) => ({ current: initialValue || null }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useCallback: (cb: any) => cb,
  }
})

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(),
}))

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock CharacterLoader and others to avoid complex logic
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isObject3D: true, children: [] },
    bodyMesh: null,
    skeleton: null,
    bones: new Map(),
    morphTargetMap: {},
    animations: []
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

  it('renders a group containing character rig with correct transform', () => {
    // Call the component directly
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    expect(children.some(c => (c as any).type === 'primitive')).toBe(true)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
     // @ts-ignore
    const result = CharacterRenderer.type({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // The selection ring should be one of the children
    expect(children.some(c => (c as any).type === 'mesh' &&
      React.Children.toArray((c as any).props.children).some(gc => (gc as any).type === 'ringGeometry'))).toBe(true)
  })
})
