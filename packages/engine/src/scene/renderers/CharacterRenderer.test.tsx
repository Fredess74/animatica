import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react hooks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn((val) => ({ current: val })),
    useMemo: vi.fn((factory) => factory()),
    useEffect: vi.fn(),
    useCallback: vi.fn((cb) => cb),
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockActor: CharacterActor = {
    id: 'char-1',
    name: 'Human',
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

  it('renders a group with correct transform and rig primitive', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement<{ position: number[], rotation: number[], scale: number[], children: React.ReactNode }>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement<{ object: any }>[]

    // First child should be the primitive for the rig root
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect(rigPrimitive.props.object).toBeInstanceOf(THREE.Group)
  })

  it('renders a group with visible: false when actor is invisible', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement<{ visible: boolean }>
    expect(result.type).toBe('group')
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement<{ children: React.ReactNode }>
    const props = result.props
    const children = React.Children.toArray(props.children) as React.ReactElement<{ children: React.ReactNode }>[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing).toBeDefined()
    expect(selectionRing.type).toBe('mesh')

    const ringChildren = React.Children.toArray(selectionRing.props.children) as React.ReactElement[]
    expect(ringChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
