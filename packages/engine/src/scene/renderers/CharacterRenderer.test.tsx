import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useMemo: (factory: () => any) => factory(),
    useEffect: vi.fn(),
  }
})

// Mock @react-three/fiber's useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock Humanoid
vi.mock('../../character/Humanoid', () => ({
    Humanoid: (props: any) => React.createElement('group', { ...props })
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

  it('renders a group with correct transform and Humanoid child', () => {
    // Call the component directly as a function for testing
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement<any>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement<any>[]

    // First child should be the Humanoid component
    const humanoid = children[0]
    expect(humanoid.props.actor).toBe(mockActor)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement<any>
    expect(result).toBeNull()
  })

  it('renders selection indicator ring when isSelected is true', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement<any>
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement<any>[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing).toBeDefined()
    expect((selectionRing as any).type).toBe('mesh')
  })
})
