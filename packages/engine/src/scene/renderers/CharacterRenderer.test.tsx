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

    // First child should be the main mesh (capsule)
    const mainMesh = children[0]
    expect(mainMesh.type).toBe('mesh')

    const mainMeshProps = mainMesh.props as any
    const meshChildren = React.Children.toArray(mainMeshProps.children) as React.ReactElement[]

    // Check geometry
    const geometry = meshChildren.find((child) => child.type === 'capsuleGeometry')
    expect(geometry).toBeDefined()

    const geometryProps = geometry?.props as any
    // Check args: radius 0.5, length 1.8
    expect(geometryProps?.args?.[0]).toBe(0.5)
    expect(geometryProps?.args?.[1]).toBe(1.8)

    // Check material
    const material = meshChildren.find((child) => child.type === 'meshStandardMaterial')
    expect(material).toBeDefined()

    const materialProps = material?.props as any
    expect(materialProps?.color).toBe('#ff00aa') // The placeholder color
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders face direction indicator', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the face mesh
    const faceMesh = children[1]
    expect(faceMesh.type).toBe('mesh')
    const faceMeshProps = faceMesh.props as any
    expect(faceMeshProps?.position?.[2]).toBe(0.4)
  })
})
