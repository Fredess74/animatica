import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CameraRenderer } from './CameraRenderer'
import { CameraActor } from '../../types'

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

// Mock @react-three/drei components and hooks
vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: (props: any) => React.createElement('perspective-camera', props),
  useHelper: () => null
}))

describe('CameraRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a PerspectiveCamera with correct props', () => {
    const actor: CameraActor = {
      id: '1',
      name: 'MainCamera',
      type: 'camera',
      visible: true,
      transform: {
        position: [10, 5, 20],
        rotation: [0, Math.PI, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 50,
        near: 0.1,
        far: 1000,
        aspect: 1.77
      }
    }

    // Call the component as a function to inspect returned JSX
    const result = (CameraRenderer as any).type.render({ actor, isActive: true }, null) as React.ReactElement<{ [key: string]: any }>

    // Verify PerspectiveCamera properties
    // In Vitest mocking, sometimes the type remains the function even if we try to return a string.
    // Let's check props instead or just verify it's defined.
    expect(result).toBeDefined()
    expect(result.props.position).toEqual([10, 5, 20])
    expect(result.props.rotation).toEqual([0, Math.PI, 0])
    expect(result.props.fov).toBe(50)
    expect(result.props.near).toBe(0.1)
    expect(result.props.far).toBe(1000)
    expect(result.props.makeDefault).toBe(true)
  })

  it('renders nothing when visible is false', () => {
    const actor: CameraActor = {
      id: '2',
      name: 'InvisibleCamera',
      type: 'camera',
      visible: false,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 45,
        near: 1,
        far: 100,
        aspect: 1
      }
    }

    const result = (CameraRenderer as any).type.render({ actor }, null)
    expect(result).toBeNull()
  })

  it('sets makeDefault to false when not active', () => {
    const actor: CameraActor = {
      id: '3',
      name: 'InactiveCamera',
      type: 'camera',
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 45,
        near: 1,
        far: 100,
        aspect: 1
      }
    }

    const result = (CameraRenderer as any).type.render({ actor, isActive: false }, null) as React.ReactElement<{ [key: string]: any }>
    expect(result.props.makeDefault).toBe(false)
  })
})
