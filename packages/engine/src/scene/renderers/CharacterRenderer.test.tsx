import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import { Humanoid } from '../../character/Humanoid'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial || null }),
    useMemo: (factory: any) => factory(),
    useEffect: vi.fn(),
    memo: (comp: any) => {
        comp.displayName = 'MemoComp'
        return comp
    },
  }
})

// Mock R3F useFrame
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}))

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock Humanoid component
vi.mock('../../character/Humanoid', () => ({
    Humanoid: vi.fn(() => null)
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

  it('renders a group containing the Humanoid component with correct transform', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the Humanoid component
    const humanoid = children[0]
    expect(humanoid.type).toBe(Humanoid)
  })

  it('renders a group with visible set to false when actor is invisible', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement
    expect(result).not.toBeNull()
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator ring when selected', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection indicator
    const indicator = children[1]
    expect(indicator.type).toBe('mesh')

    const indicatorChildren = React.Children.toArray(indicator.props.children) as React.ReactElement[]
    expect(indicatorChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
