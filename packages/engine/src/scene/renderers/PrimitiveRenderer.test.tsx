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

// Type for inspecting React elements in tests
interface TestElement {
  type: string
  props: {
    [key: string]: unknown
    children?: React.ReactNode
  }
}

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
    const result = PrimitiveRenderer({ actor }) as unknown as TestElement

    // Verify mesh properties
    expect(result.type).toBe('mesh')
    expect(result.props.position).toEqual([10, 20, 30])
    expect(result.props.rotation).toEqual([0, 1, 0])
    expect(result.props.scale).toEqual([2, 2, 2])

    // Verify children (geometry and material)
    // We cast to TestElement[] because we know the structure in this test environment
    const children = React.Children.toArray(result.props.children) as unknown as TestElement[]

    // Check geometry
    const geometry = children.find((child) => child.type === 'boxGeometry')
    expect(geometry).toBeDefined()

    // Check material
    const material = children.find((child) => child.type === 'meshStandardMaterial')
    expect(material).toBeDefined()

    // Check material props
    const matProps = material!.props
    expect(matProps.color).toBe('#ff0000')
    expect(matProps.roughness).toBe(0.5)
    expect(matProps.metalness).toBe(0.3)
    expect(matProps.opacity).toBe(0.8)
    expect(matProps.transparent).toBe(true)
    expect(matProps.wireframe).toBe(true)
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

    const result = PrimitiveRenderer({ actor }) as unknown as TestElement
    const children = React.Children.toArray(result.props.children) as unknown as TestElement[]
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

    const result = PrimitiveRenderer({ actor })
    expect(result).toBeNull()
  })
})
