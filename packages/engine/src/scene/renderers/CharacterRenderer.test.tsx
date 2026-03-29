import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react hooks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useEffect: vi.fn(),
    useMemo: vi.fn((fn) => fn()),
  }
})

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock assets/rig
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', name: 'rig-root' },
    bodyMesh: {},
    morphTargetMap: {}
  })),
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
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    if (!result) return
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify presence of rig
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const rig = children.find((c: any) => c.type === 'primitive')
    expect(rig).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement

    // CharacterRenderer returns the group but with visible={false}
    expect(result).not.toBeNull()
    if (result) {
        expect(result.props.visible).toBe(false)
    }
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    expect(result).not.toBeNull()
    if (result) {
        const children = React.Children.toArray(result.props.children) as React.ReactElement[]
        const ring = children.find((c: any) => c.type === 'mesh')
        expect(ring).toBeDefined()
    }
  })
})
