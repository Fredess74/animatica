import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initialValue: any) => ({ current: initialValue || null }),
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useImperativeHandle: () => {},
    forwardRef: (render: any) => ({
      render,
      displayName: 'ForwardRef'
    }),
    memo: (comp: any) => ({
      type: comp,
      displayName: 'Memo'
    })
  }
})

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
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
    // The component is Memo(ForwardRef(render))
    const renderFunc = (CharacterRenderer as any).type.render;
    const result = renderFunc({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the primitive rig
    const primitiveRig = children[0]
    expect(primitiveRig.type).toBe('primitive')
    expect(primitiveRig.props.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const renderFunc = (CharacterRenderer as any).type.render;
    const result = renderFunc({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const renderFunc = (CharacterRenderer as any).type.render;
    const result = renderFunc({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // Find the mesh that is the selection indicator (ringGeometry)
    const selectionIndicator = children.find(child => {
      if (typeof child !== 'object' || child === null || !('type' in child)) return false;
      if (child.type !== 'mesh') return false;
      const meshChildren = React.Children.toArray(child.props.children) as React.ReactElement[];
      return meshChildren.some(mc => typeof mc === 'object' && mc !== null && 'type' in mc && mc.type === 'ringGeometry');
    });

    expect(selectionIndicator).toBeDefined()
  })
})
