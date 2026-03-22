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
    useLayoutEffect: () => {},
    useImperativeHandle: () => {},
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual<typeof import('@react-three/fiber')>('@react-three/fiber')
  return {
    ...actual,
    useFrame: () => {},
    useThree: () => ({
      gl: { domElement: {} },
      camera: {},
      scene: {},
      size: { width: 100, height: 100 },
    }),
  }
})

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
    // Access the render function from the memo/forwardRef wrapper
    const result = (CharacterRenderer as any).type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the rig root (primitive object)
    const rigRoot = children[0] as React.ReactElement<any>
    expect(rigRoot.type).toBe('primitive')
    expect(rigRoot.props.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = (CharacterRenderer as any).type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const result = (CharacterRenderer as any).type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1] as React.ReactElement<any>
    expect(selectionRing.type).toBe('mesh')

    const ringChildren = React.Children.toArray(selectionRing.props.children) as React.ReactElement[]
    expect(ringChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
