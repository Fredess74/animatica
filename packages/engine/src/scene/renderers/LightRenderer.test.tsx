import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { LightRenderer } from './LightRenderer'
import { LightActor } from '../../types'
import * as THREE from 'three'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: new THREE.Object3D() }),
    useLayoutEffect: () => {}, // mock useLayoutEffect
    useMemo: (fn: any) => fn(), // mock useMemo to just run the function
  }
})

// Mock useHelper
vi.mock('@react-three/drei', () => ({
  useHelper: vi.fn(),
}))

describe('LightRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a point light with correct props', () => {
    const actor: LightActor = {
      id: 'l1',
      name: 'PointLight',
      type: 'light',
      visible: true,
      transform: {
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'point',
        intensity: 2,
        color: '#ff0000',
        castShadow: true
      }
    }

    const result = LightRenderer({ actor }) as unknown as { type: string, props: any }

    // It returns a group
    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([0, 5, 0])

    const children = React.Children.toArray(result.props.children)
    // First child is primitive (target)
    const target = children.find((c: any) => c.type === 'primitive')
    expect(target).toBeDefined()

    // Second child is the light
    const light = children.find((c: any) => c.type === 'pointLight')
    expect(light).toBeDefined()
    expect((light as any).props.intensity).toBe(2)
    expect((light as any).props.color).toBe('#ff0000')
    expect((light as any).props.castShadow).toBe(true)
  })

  it('renders a directional light with target', () => {
    const actor: LightActor = {
      id: 'l2',
      name: 'Sun',
      type: 'light',
      visible: true,
      transform: {
        position: [10, 10, 10],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'directional',
        intensity: 1,
        color: '#ffffff',
        castShadow: false
      }
    }

    const result = LightRenderer({ actor }) as unknown as { type: string, props: any }
    const children = React.Children.toArray(result.props.children)

    const light = children.find((c: any) => c.type === 'directionalLight')
    expect(light).toBeDefined()
    // Verify target prop is passed (it will be the mocked ref object)
    expect((light as any).props.target).toBeDefined()
  })

  it('renders a spot light with correct props', () => {
    const actor: LightActor = {
      id: 'l3',
      name: 'Spot',
      type: 'light',
      visible: true,
      transform: {
        position: [0, 10, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'spot',
        intensity: 5,
        color: '#00ff00',
        castShadow: true
      }
    }

    const result = LightRenderer({ actor }) as unknown as { type: string, props: any }
    const children = React.Children.toArray(result.props.children)

    const light = children.find((c: any) => c.type === 'spotLight')
    expect(light).toBeDefined()
    expect((light as any).props.angle).toBeCloseTo(Math.PI / 6)
    expect((light as any).props.target).toBeDefined()
  })

  it('handles invalid light type gracefully', () => {
    const actor: LightActor = {
      id: 'l4',
      name: 'Invalid',
      type: 'light',
      visible: true,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: {
        lightType: 'invalid-type' as any,
        intensity: 1,
        color: '#fff',
        castShadow: false
      }
    }
    const result = LightRenderer({ actor, showHelper: true }) as unknown as { type: string, props: any }
    const children = React.Children.toArray(result.props.children)

    // Should render the target primitive but no light component
    expect(children.length).toBe(1)
    expect((children[0] as any).type).toBe('primitive')
  })

  it('renders nothing when visible is false', () => {
     const actor: LightActor = {
      id: 'l3',
      name: 'Hidden',
      type: 'light',
      visible: false,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: {
        lightType: 'point',
        intensity: 1,
        color: '#fff',
        castShadow: false
      }
    }
    const result = LightRenderer({ actor })
    expect(result).toBeNull()
  })
})
