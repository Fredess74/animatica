import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { PrimitiveRenderer } from './PrimitiveRenderer'
import { PrimitiveActor } from '../../types'

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

describe('PrimitiveRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a box primitive with correct material props', () => {
    const actor: PrimitiveActor = {
      id: '1',
      name: 'Box',
      type: 'primitive',
      visible: true,
      transform: {
        position: [10, 20, 30],
        rotation: [0, 1, 0],
        scale: [2, 2, 2]
      },
      properties: {
        shape: 'box',
        color: '#ff0000',
        roughness: 0.5,
        metalness: 0.3,
        opacity: 0.8,
        wireframe: true
      }
    }

    // Call the component as a function to inspect returned JSX
    // Since we mocked useRef, it won't throw "Invalid hook call"
    // Access the underlying component function from React.memo
    const Component = (PrimitiveRenderer as any).type;
    const result = Component({ actor }) as React.ReactElement<{ [key: string]: any }>

    // Verify mesh properties
    expect(result.type).toBe('mesh')
    expect(result.props.position).toEqual([10, 20, 30])
    expect(result.props.rotation).toEqual([0, 1, 0])
    expect(result.props.scale).toEqual([2, 2, 2])

    // Verify children (geometry and material)
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]

    // Check geometry
    const geometry = children.find((child) => child.type === 'boxGeometry')
    expect(geometry).toBeDefined()

    // Check material
    const material = children.find((child) => child.type === 'meshStandardMaterial')
    expect(material).toBeDefined()
    expect(material?.props.color).toBe('#ff0000')
    expect(material?.props.roughness).toBe(0.5)
    expect(material?.props.metalness).toBe(0.3)
    expect(material?.props.opacity).toBe(0.8)
    expect(material?.props.transparent).toBe(true)
    expect(material?.props.wireframe).toBe(true)
  })

  it('renders sphere geometry when shape is sphere', () => {
    const actor: PrimitiveActor = {
      id: '2',
      name: 'Sphere',
      type: 'primitive',
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        shape: 'sphere',
        color: '#ffffff',
        roughness: 0,
        metalness: 0,
        opacity: 1,
        wireframe: false
      }
    }

    const Component = (PrimitiveRenderer as any).type;
    const result = Component({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    const geometry = children.find((child) => child.type === 'sphereGeometry')
    expect(geometry).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const actor: PrimitiveActor = {
      id: '3',
      name: 'Invisible',
      type: 'primitive',
      visible: false,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        shape: 'box',
        color: '#ffffff',
        roughness: 0,
        metalness: 0,
        opacity: 1,
        wireframe: false
      }
    }

    const Component = (PrimitiveRenderer as any).type;
    const result = Component({ actor })
    expect(result).toBeNull()
  })
})
