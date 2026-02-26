import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CameraRenderer } from './CameraRenderer'
import { CameraActor } from '../../types'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: new THREE.Object3D() }),
  }
})

// Mock three components used inside CameraRenderer
vi.mock('@react-three/drei', () => ({
  // Mock PerspectiveCamera as a simple functional component that returns a 'perspectiveCamera' element
  PerspectiveCamera: ({ children, ...props }: any) => React.createElement('perspectiveCamera', props, children),
  useHelper: vi.fn(),
}))

describe('CameraRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a camera with correct props', () => {
    const actor: CameraActor = {
      id: 'c1',
      name: 'Cam1',
      type: 'camera',
      visible: true,
      transform: {
        position: [0, 10, 20],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      properties: {
        fov: 75,
        near: 0.1,
        far: 1000
      }
    }

    const result = CameraRenderer({ actor, isActive: false }) as unknown as { type: string, props: any }

    // Check perspectiveCamera mock
    expect(result.type).toBe(PerspectiveCamera)
    expect(result.props.position).toEqual([0, 10, 20])
    expect(result.props.fov).toBe(75)
    expect(result.props.near).toBe(0.1)
    expect(result.props.far).toBe(1000)
    expect(result.props.makeDefault).toBe(false)
  })

  it('sets makeDefault when isActive is true', () => {
    const actor: CameraActor = {
      id: 'c2',
      name: 'Cam2',
      type: 'camera',
      visible: true,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: { fov: 60, near: 0.1, far: 100 }
    }

    const result = CameraRenderer({ actor, isActive: true }) as unknown as { type: string, props: any }
    expect(result.props.makeDefault).toBe(true)
  })

  it('renders nothing when visible is false', () => {
    const actor: CameraActor = {
      id: 'c3',
      name: 'HiddenCam',
      type: 'camera',
      visible: false,
      transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
      properties: { fov: 60, near: 0.1, far: 100 }
    }
    const result = CameraRenderer({ actor })
    expect(result).toBeNull()
  })
})
