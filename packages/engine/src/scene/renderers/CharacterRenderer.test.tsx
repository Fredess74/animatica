import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

/**
 * CharacterRenderer.test.tsx — Updated to match the delegated Humanoid renderer architecture.
 */

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    forwardRef: (render: any) => ({ type: { render } }),
    memo: (comp: any) => comp,
    useImperativeHandle: vi.fn(),
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null,
  useGLTF: () => ({ scene: { clone: () => ({ traverse: vi.fn() }) }, animations: [] })
}))

// Mock Humanoid component
vi.mock('../../character/Humanoid', () => ({
  Humanoid: () => <primitive object={{}} name="humanoid-rig" />
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

  it('renders a group containing the Humanoid rig with correct transform', () => {
    // Call the forwardRef component's render function directly
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

    // First child should be the <Humanoid /> component (which we've mocked to return a primitive)
    const humanoidComp = children[0] as React.ReactElement
    expect(humanoidComp).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1] as any
    expect(selectionRing.type).toBe('mesh')

    const ringMaterial = (React.Children.toArray(selectionRing.props.children) as any[])
        .find(c => c.type === 'meshBasicMaterial')
    expect(ringMaterial.props.color).toBe('#22C55E')
  })
})
