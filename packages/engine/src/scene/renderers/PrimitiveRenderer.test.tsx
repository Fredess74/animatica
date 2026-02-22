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
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>

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

    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    const geometry = children.find((child) => child.type === 'sphereGeometry')
    expect(geometry).toBeDefined()
  })

  it('renders cylinder geometry', () => {
    const actor: PrimitiveActor = {
      id: '3',
      name: 'Cylinder',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'cylinder', color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    expect(children.find((child) => child.type === 'cylinderGeometry')).toBeDefined()
  })

  it('renders plane geometry', () => {
    const actor: PrimitiveActor = {
      id: '4',
      name: 'Plane',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'plane', color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    expect(children.find((child) => child.type === 'planeGeometry')).toBeDefined()
  })

  it('renders cone geometry', () => {
    const actor: PrimitiveActor = {
      id: '5',
      name: 'Cone',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'cone', color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    expect(children.find((child) => child.type === 'coneGeometry')).toBeDefined()
  })

  it('renders torus geometry', () => {
    const actor: PrimitiveActor = {
      id: '6',
      name: 'Torus',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'torus', color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    expect(children.find((child) => child.type === 'torusGeometry')).toBeDefined()
  })

  it('renders capsule geometry', () => {
    const actor: PrimitiveActor = {
      id: '7',
      name: 'Capsule',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'capsule', color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    expect(children.find((child) => child.type === 'capsuleGeometry')).toBeDefined()
  })

  it('renders box geometry as default fallback', () => {
    const actor: PrimitiveActor = {
      id: '8',
      name: 'Unknown',
      type: 'primitive',
      visible: true,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { shape: 'invalid-shape' as any, color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    expect(children.find((child) => child.type === 'boxGeometry')).toBeDefined()
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

    const result = PrimitiveRenderer({ actor })
    expect(result).toBeNull()
  })

  it('renders selection edges when isSelected is true', () => {
    const actor: PrimitiveActor = {
      id: '9',
      name: 'Selected',
      type: 'primitive',
      visible: true,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: { shape: 'box', color: '#fff', roughness: 0, metalness: 0, opacity: 1, wireframe: false }
    }
    const result = PrimitiveRenderer({ actor, isSelected: true }) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    // We mocked Edges to return null, but it should still be in the children list as a React Element (type Edges)
    // Wait, vi.mock('@react-three/drei', () => ({ Edges: () => null }))
    // This means Edges is a functional component that returns null.
    // In the children array, it will appear as an element with type equal to that mocked function.

    // However, finding it by type name might be tricky if it's an anonymous function.
    // Let's just check if there are 3 children (geometry, material, edges).
    expect(children.length).toBe(3)
  })
})
