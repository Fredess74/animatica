/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useEffect: vi.fn(),
    useMemo: (fn: any) => fn(),
    useCallback: (fn: any) => fn,
    forwardRef: (comp: any) => comp,
    memo: (comp: any) => comp,
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null,
  useGLTF: Object.assign(vi.fn(() => ({
    scene: { clone: () => ({ traverse: vi.fn() }) },
    animations: [],
  })), {
    preload: vi.fn(),
  }),
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.clearAllMocks()
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
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('renders a group containing Suspense', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have Suspense
    const suspense = children.find(c =>
      c.type && (
        (c.type as any).displayName === 'Suspense' ||
        c.type.toString().includes('Symbol(react.suspense)') ||
        (typeof c.type === 'object' && (c.type as any).$$typeof?.toString().includes('Symbol(react.suspense)'))
      )
    )
    expect(suspense).toBeDefined()
  })

  it('renders selection ring when selected', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    const ring = children.find(c => c.type === 'mesh')
    expect(ring).toBeDefined()
  })
})
