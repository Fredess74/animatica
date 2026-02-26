import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: { name: 'mock-group' } }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
    memo: (c: any) => {
      c.displayName = 'MemoizedComponent';
      return c;
    }
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
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
    clothing: { head: [], torso: [], arms: [], legs: [] }
  }

  it('renders a group with correct transform and a primitive for the rig', () => {
    const Component = (CharacterRenderer as any).type || CharacterRenderer;
    const result = Component({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have a primitive child for the humanoid rig
    const primitive = children.find(child => child.type === 'primitive')
    expect(primitive).toBeDefined()
    expect(primitive?.props.object).toBeDefined()
    expect(primitive?.props.object.type).toBe('Group')
  })

  it('renders nothing when visible is false', () => {
    const Component = (CharacterRenderer as any).type || CharacterRenderer;
    const result = Component({ actor: { ...mockActor, visible: false } })
    expect(result).toBeNull()
  })

  it('renders selection ring when selected', () => {
    const Component = (CharacterRenderer as any).type || CharacterRenderer;
    const result = Component({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // Should find a mesh with ringGeometry
    const selectionRing = children.find(child =>
      child.type === 'mesh' &&
      React.Children.toArray(child.props.children).some((c: any) => c.type === 'ringGeometry')
    )
    expect(selectionRing).toBeDefined()
  })
})
