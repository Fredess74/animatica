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
    useImperativeHandle: vi.fn(),
  }
})

// Mock R3F hooks
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

  it('renders a group containing character rig', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)

    // Verify children contains primitive for rig
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const rigPrimitive = children.find(c => c.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('sets visibility correctly', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, { current: null }) as React.ReactElement
    expect(result.props.visible).toBe(false)
  })
})
