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
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
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
    clothing: {}
  }

  it('renders a group with correct transform', () => {
    // CharacterRenderer is not wrapped in memo or forwardRef in the source!
    // It's a standard functional component.
    const result = (CharacterRenderer as any)({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('respects visibility prop', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = (CharacterRenderer as any)({ actor: invisibleActor }) as React.ReactElement
    expect((result.props as any).visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
    const result = (CharacterRenderer as any)({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray((result.props as any).children) as React.ReactElement[]

    // Check for the selection ring (mesh)
    const selectionRing = children.find(c => c.type === 'mesh' && React.Children.toArray((c.props as any).children).some((gc: any) => gc.type === 'ringGeometry'))
    expect(selectionRing).toBeDefined()
  })
})
