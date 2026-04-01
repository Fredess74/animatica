import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (factory: () => any) => factory(),
    useEffect: () => {},
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

  it('renders a group containing the rig root with correct transform', () => {
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

    // First child should be the primitive object (rig root)
    const rigRoot = children[0] as React.ReactElement
    expect(rigRoot.type).toBe('primitive')
    expect((rigRoot.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement

    // In CharacterRenderer.tsx, visible is passed to <group>, but it doesn't return null if !visible
    // (Unlike PrimitiveRenderer which returns null)
    expect(result).not.toBeNull()
    const props = result.props as any
    expect(props.visible).toBe(false)
  })

  it('renders selection indicator ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1] as React.ReactElement
    expect(selectionRing).toBeDefined()
    expect(selectionRing.type).toBe('mesh')

    const ringChildren = React.Children.toArray((selectionRing.props as any).children) as React.ReactElement[]
    expect(ringChildren.some(child => (child as any).type === 'ringGeometry')).toBe(true)
  })
})
