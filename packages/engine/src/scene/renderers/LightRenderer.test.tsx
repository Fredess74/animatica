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

    // Second child is the LightSource component
    const lightSource = children.find((c: any) => typeof c.type === 'function')
    expect(lightSource).toBeDefined()

    // Manually render LightSource to inspect the actual light
    const light = (lightSource as any).type((lightSource as any).props)
    expect(light.type).toBe('pointLight')
    expect(light.props.intensity).toBe(2)
    expect(light.props.color).toBe('#ff0000')
    expect(light.props.castShadow).toBe(true)
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

    const lightSource = children.find((c: any) => typeof c.type === 'function')
    expect(lightSource).toBeDefined()

    const light = (lightSource as any).type((lightSource as any).props)
    expect(light.type).toBe('directionalLight')
    // Verify target prop is passed (it will be the mocked ref object)
    expect(light.props.target).toBeDefined()
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
