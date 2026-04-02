import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CameraRenderer } from './CameraRenderer'
import { CameraActor } from '../../types'

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

// Mock @react-three/drei
vi.mock('@react-three/drei', () => {
  return {
    PerspectiveCamera: (props: any) => React.createElement('perspective-camera', props),
    useHelper: vi.fn()
  }
})

describe('CameraRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a camera with correct props', () => {
    const actor: CameraActor = {
      id: 'cam-1',
      name: 'MainCamera',
      type: 'camera',
      visible: true,
      transform: {
        position: [0, 5, 10],
        rotation: [-0.5, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 45,
        near: 0.1,
        far: 1000
      }
    }

    // Access the render function from the mocked forwardRef
    // @ts-ignore
    const render = CameraRenderer.render || CameraRenderer.type?.render
    const result = render({ actor, isActive: false }, { current: null }) as React.ReactElement

    // Check perspectiveCamera mock
    // Check by tag name in props if type is a function/object that returns it
    expect(result.props).toBeDefined()
    expect(result.props.position).toEqual([0, 5, 10])
    expect(result.props.rotation).toEqual([-0.5, 0, 0])
    expect(result.props.fov).toBe(45)
    expect(result.props.near).toBe(0.1)
    expect(result.props.far).toBe(1000)
    expect(result.props.makeDefault).toBe(false)
  })

  it('sets makeDefault when isActive is true', () => {
    const actor: CameraActor = {
      id: 'cam-1',
      name: 'MainCamera',
      type: 'camera',
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 50,
        near: 0.1,
        far: 100
      }
    }

    // @ts-ignore
    const render = CameraRenderer.render || CameraRenderer.type?.render
    const result = render({ actor, isActive: true }, { current: null }) as React.ReactElement
    expect(result.props.makeDefault).toBe(true)
  })

  it('renders nothing when visible is false', () => {
    const actor: CameraActor = {
      id: 'cam-off',
      name: 'Off',
      type: 'camera',
      visible: false,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      properties: { fov: 50, near: 0.1, far: 100 }
    }
    // @ts-ignore
    const render = CameraRenderer.render || CameraRenderer.type?.render
    const result = render({ actor }, { current: null })
    expect(result).toBeNull()
  })
})
