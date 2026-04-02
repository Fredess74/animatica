import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { LightRenderer } from './LightRenderer'
import { LightActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useMemo: (factory: () => any) => factory(),
    useImperativeHandle: vi.fn(),
    // Standard mock for forwardRef to allow inspection of the render function
    forwardRef: (render: any) => ({ render, type: { render } }),
    memo: (comp: any) => comp,
  }
})

// Mock @react-three/drei hooks
vi.mock('@react-three/drei', () => ({
  useHelper: vi.fn()
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
        position: [5, 5, 5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'point',
        intensity: 1.5,
        color: '#ffffff',
        castShadow: true
      }
    }

    // Access the render function from the mocked forwardRef
    // @ts-ignore
    const render = LightRenderer.render || LightRenderer.type?.render
    const result = render({ actor }, { current: null }) as React.ReactElement

    // It returns a group
    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([5, 5, 5])

    const children = React.Children.toArray(result.props.children) as React.ReactElement[]
    const light = children.find(child => child.type === 'pointLight')
    expect(light).toBeDefined()
    expect(light?.props.intensity).toBe(1.5)
    expect(light?.props.color).toBe('#ffffff')
    expect(light?.props.castShadow).toBe(true)
  })

  it('renders a directional light with target', () => {
    const actor: LightActor = {
      id: 'l2',
      name: 'Sun',
      type: 'light',
      visible: true,
      transform: {
        position: [0, 10, 0],
        rotation: [-Math.PI / 4, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        lightType: 'directional',
        intensity: 1.0,
        color: '#ffff00',
        castShadow: true
      }
    }

    // @ts-ignore
    const render = LightRenderer.render || LightRenderer.type?.render
    const result = render({ actor }, { current: null }) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const light = children.find(child => child.type === 'directionalLight')
    expect(light).toBeDefined()
    expect(light?.props.target).toBeDefined()

    // Find the target primitive
    const targetPrimitive = children.find(child => child.type === 'primitive')
    expect(targetPrimitive).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const actor: LightActor = {
      id: 'l3',
      name: 'Off',
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
        color: '#fff',
        castShadow: false
      }
    }

    // @ts-ignore
    const render = LightRenderer.render || LightRenderer.type?.render
    const result = render({ actor }, { current: null })
    expect(result).toBeNull()
  })
})
