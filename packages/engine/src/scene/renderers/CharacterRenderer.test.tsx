import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    memo: (comp: any) => comp,
  }
})

// Mock R3F useFrame
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

  it('renders a group containing primitive with correct transform', () => {
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Check for primitive object (rig.root)
    const primitive = children.find((child) => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection ring should be present
    const selectionRing = children.find((child) => child.type === 'mesh' && (child.props as any).position?.[1] === 0.01)
    expect(selectionRing).toBeDefined()
  })

  it('renders eyes in the rig root', () => {
    // This indirectly tests if the rig is built correctly and rendered
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    const primitive = children.find((child) => child.type === 'primitive') as any
    const rigRoot = primitive.props.object as THREE.Group

    let eyesFound = 0
    rigRoot.traverse((child) => {
      if (child.name === 'Head') {
        const eyes = child.children.filter(c => c.type === 'Mesh' && c.geometry.type === 'SphereGeometry')
        eyesFound = eyes.length
      }
    })

    // Procedural humanoid has 2 eyes
    expect(eyesFound).toBeGreaterThanOrEqual(2)
  })
})
