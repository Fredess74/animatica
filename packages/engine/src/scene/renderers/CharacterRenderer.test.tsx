import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useLayoutEffect: () => {},
  }
})

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
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

  it('renders a group containing character rig with correct transform', () => {
    // Call the component's render function directly via .type
    // @ts-ignore
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: mockActor }) as React.ReactElement

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
    expect((rig.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator ring when selected', () => {
    // @ts-ignore
    const Component = (CharacterRenderer as any).type
    const result = Component({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring
    const ring = children[1]
    expect(ring.type).toBe('mesh')

    const ringProps = ring.props as any
    const ringChildren = React.Children.toArray(ringProps.children) as React.ReactElement[]
    const geometry = ringChildren.find((c: any) => c.type === 'ringGeometry')
    const material = ringChildren.find((c: any) => c.type === 'meshBasicMaterial')

    expect(geometry).toBeDefined()
    expect(material).toBeDefined()
    expect((material as any).props.color).toBe('#22C55E')
  })
})
