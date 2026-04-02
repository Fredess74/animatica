// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import type { CharacterActor } from '../../types'

// Mock React hooks to return values since we're calling the render function directly
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial || {} }),
    useMemo: (factory: any) => factory(),
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    useCallback: (fn: any) => fn,
    useImperativeHandle: vi.fn(),
    memo: (comp: any) => comp,
    forwardRef: (comp: any) => {
        comp.type = { render: comp };
        return comp;
    },
  }
})

class GeometryStub {
  rotateZ = vi.fn()
  clone = vi.fn().mockReturnThis()
}

// Mock Three.js using classes for constructors
vi.mock('three', () => {
  class Group {
    add = vi.fn()
    remove = vi.fn()
    matrixWorld = { setFromMatrixPosition: vi.fn() }
    position = { set: vi.fn() }
    rotation = { set: vi.fn() }
    scale = { set: vi.fn() }
  }
  class Mesh {
    position = { set: vi.fn() }
    castShadow = true
    receiveShadow = true
    add = vi.fn()
    constructor(geometry: any, material: any) {
        (this as any).geometry = geometry;
        (this as any).material = material;
    }
  }
  class Vector3 {
    setFromMatrixPosition = vi.fn()
    constructor(x=0, y=0, z=0) {
        (this as any).x = x; (this as any).y = y; (this as any).z = z;
    }
  }
  class Euler {
    set = vi.fn()
  }
  class Quaternion {
    setFromEuler = vi.fn()
    slerp = vi.fn()
    clone = vi.fn().mockReturnThis()
    equals = vi.fn().mockReturnValue(true)
  }
  class AnimationMixer {
    clipAction = vi.fn().mockImplementation(() => ({
        setEffectiveWeight: vi.fn(),
        play: vi.fn(),
        reset: vi.fn(),
        crossFadeTo: vi.fn(),
    }))
    stopAllAction = vi.fn()
    update = vi.fn()
  }
  class Bone {
    name = ''
    position = { set: vi.fn() }
    add = vi.fn()
    quaternion = new Quaternion()
  }
  class GeometryStubInternal {
    rotateZ = vi.fn()
    clone = vi.fn().mockReturnThis()
  }
  return {
    Group,
    Mesh,
    Vector3,
    DoubleSide: 2,
    Euler,
    Quaternion,
    AnimationMixer,
    AnimationClip: class {
        static optimize = vi.fn()
        optimize = vi.fn()
    },
    Skeleton: class {},
    Bone,
    MeshPhysicalMaterial: class {},
    MeshStandardMaterial: class {},
    SphereGeometry: GeometryStubInternal,
    CapsuleGeometry: GeometryStubInternal,
    BoxGeometry: GeometryStubInternal,
    RingGeometry: GeometryStubInternal,
    Color: class { set = vi.fn() },
    VectorKeyframeTrack: class {},
    QuaternionKeyframeTrack: class {},
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

const mockActor: CharacterActor = {
  id: 'test-actor-id',
  type: 'character',
  name: 'Test Character',
  transform: {
    position: [1, 2, 3],
    rotation: [0, Math.PI, 0],
    scale: [1, 1, 1],
  },
  visible: true,
  animation: 'idle',
  morphTargets: {},
  bodyPose: {
    head: [0.1, 0.2, 0.3],
  },
  clothing: {},
}

describe('CharacterRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly (structural check)', () => {
    // @ts-ignore
    const renderFn = CharacterRenderer.type.render

    const result = renderFn({ actor: mockActor }, null)

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')
    expect(result.props.name).toBe(mockActor.id)
    expect(result.props.position).toEqual(mockActor.transform.position)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const renderFn = CharacterRenderer.type.render
    const result = renderFn({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    // @ts-ignore
    const renderFn = CharacterRenderer.type.render
    const result = renderFn({ actor: mockActor, isSelected: true }, null)

    // Find mesh with ringGeometry
    const children = React.Children.toArray(result.props.children)
    const hasSelectionRing = children.some((child: any) =>
        child && child.type === 'mesh' && React.Children.toArray(child.props.children).some((gc: any) => gc.type === 'ringGeometry')
    )
    expect(hasSelectionRing).toBe(true)
  })
})
