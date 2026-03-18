import { describe, it, expect, vi, afterEach } from 'vitest'
import React, { ReactElement } from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useEffect: () => {},
    useMemo: (factory: any) => factory(),
    useFrame: () => {},
    useImperativeHandle: () => {},
  }
})

// Mock @react-three/fiber
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

  it('renders a group containing the character rig with correct transform', () => {
    // Call the forwardRef component's render function directly
    // Since it's wrapped in memo, we access the underlying forwardRef via .type
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as ReactElement<any>

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as ReactElement<any>[]

    // First child should be the character rig (primitive)
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect(rigPrimitive.props.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, { current: null })
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, { current: null }) as ReactElement<any>
    const props = result.props
    const children = React.Children.toArray(props.children) as ReactElement<any>[]

    // Second child should be the selection indicator mesh
    const selectionMesh = children[1]
    expect(selectionMesh.type).toBe('mesh')

    const material = React.Children.toArray(selectionMesh.props.children).find(
      (child: any) => child.type === 'meshBasicMaterial'
    ) as ReactElement<any>

    expect(material.props.color).toBe('#22C55E')
  })
})
