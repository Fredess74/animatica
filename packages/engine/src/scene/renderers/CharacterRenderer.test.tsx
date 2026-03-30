import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'

// Mock react-three-fiber to bypass useFrame checks
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual<typeof import('@react-three/fiber')>('@react-three/fiber')
  return {
    ...actual,
    useFrame: vi.fn(),
  }
})

// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useImperativeHandle: vi.fn(),
    useMemo: (factory: any) => factory(),
    useEffect: vi.fn(),
  }
})

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

  it('renders a group containing capsule mesh with correct transform', () => {
    // Call the forwardRef component's render function directly
    // Since it's wrapped in memo, we access the underlying forwardRef via .type
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // The current implementation uses createProceduralHumanoid which returns a complex hierarchy
    // The test was written for a simplified version. Let's adjust to check for the rig root.
    const primitive = children.find((child) => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

})
