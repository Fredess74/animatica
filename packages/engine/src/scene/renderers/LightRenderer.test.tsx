import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { LightRenderer } from './LightRenderer'
import { LightActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useMemo: (fn: any) => fn(),
    useImperativeHandle: () => {},
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  useHelper: () => null
}))

describe('LightRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a point light with correct intensity and color', () => {
    const actor: LightActor = {
      id: '1',
      name: 'PointLight',
      type: 'light',
      visible: true,
      transform: {
        position: [1, 2, 3],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'point',
        intensity: 2,
        color: '#ffff00',
        castShadow: true
      }
    }

    // Call the component as a function to inspect returned JSX
    const result = (LightRenderer as any).type.render({ actor }, null) as React.ReactElement<{ [key: string]: any }>

    // Verify group properties
    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([1, 2, 3])

    // Verify children (light and target)
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]

    // Check light
    const light = children.find((child) => child.type === 'pointLight')
    expect(light).toBeDefined()
    expect(light?.props.intensity).toBe(2)
    expect(light?.props.color).toBe('#ffff00')
    expect(light?.props.castShadow).toBe(true)
  })

  it('renders nothing when visible is false', () => {
    const actor: LightActor = {
      id: '3',
      name: 'Invisible',
      type: 'light',
      visible: false,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'point',
        intensity: 1,
        color: '#ffffff',
        castShadow: false
      }
    }

    const result = (LightRenderer as any).type.render({ actor }, null)
    expect(result).toBeNull()
  })

  it('renders spot light when lightType is spot', () => {
    const actor: LightActor = {
      id: '2',
      name: 'SpotLight',
      type: 'light',
      visible: true,
      transform: {
        position: [0, 5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'spot',
        intensity: 5,
        color: '#ffffff',
        castShadow: true
      }
    }

    const result = (LightRenderer as any).type.render({ actor }, null) as React.ReactElement<{ [key: string]: any }>
    const children = React.Children.toArray(result.props.children) as React.ReactElement<{ [key: string]: any }>[]
    const light = children.find((child) => child.type === 'spotLight')
    expect(light).toBeDefined()
  })
})
