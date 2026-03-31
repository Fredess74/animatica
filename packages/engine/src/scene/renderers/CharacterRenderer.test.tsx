import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (fn: () => any) => fn(),
    useEffect: () => {},
    forwardRef: (render: any) => ({ type: { render } }),
    memo: (comp: any) => comp,
    useImperativeHandle: () => {},
  }
})

// Mock @react-three/fiber's useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}))

describe('CharacterRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockActor: CharacterActor = {
    id: 'char-1',
    name: 'Hero',
    type: 'character',
    visible: true,
    transform: {
      position: [10, 0, 5],
      rotation: [0, Math.PI, 0],
      scale: [1, 1, 1]
    },
    animation: 'idle',
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group containing character rig with correct transform', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // In current implementation, it renders <primitive object={rig.root} />
    const primitive = children.find(child => child.type === 'primitive')
    expect(primitive).toBeDefined()

    const rigRoot = (primitive?.props as any).object
    expect(rigRoot).toBeInstanceOf(THREE.Object3D)
  })

  it('renders with visible prop set to false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection indicator is a mesh with ringGeometry
    const selectionMesh = children.find(child => {
        if (typeof child !== 'object' || !child || !('props' in child)) return false;
        const cProps = child.props as any;
        return React.Children.toArray(cProps.children).some((gc: any) => gc.type === 'ringGeometry');
    });

    expect(selectionMesh).toBeDefined()
  })
})
