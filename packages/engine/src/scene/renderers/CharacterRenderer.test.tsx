import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useEffect: vi.fn(),
    useMemo: (factory: any) => factory(),
    useCallback: (callback: any) => callback,
    useImperativeHandle: (ref: any, factory: any) => {
      if (typeof ref === 'function') {
        ref(factory())
      } else if (ref && 'current' in ref) {
        ref.current = factory()
      }
    },
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
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

  it('renders a group with correct transform', () => {
    // Access the underlying render function from memo(forwardRef(...))
    const renderFn = (CharacterRenderer as any).type.render
    const result = renderFn({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the rig root (primitive object)
    const rigRoot = children[0]
    expect(rigRoot.type).toBe('primitive')
    expect((rigRoot.props as any).object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const renderFn = (CharacterRenderer as any).type.render
    const result = renderFn({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection ring when isSelected is true', () => {
    const renderFn = (CharacterRenderer as any).type.render
    const result = renderFn({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Third child should be the selection ring (mesh)
    // 1: primitive (rig), 2: null (isSelected false), 3: ring (isSelected true)
    // Wait, let's check the code:
    // {rig.root && <primitive object={rig.root} />}
    // {isSelected && <mesh ... />}

    const selectionRing = children.find(child => child.type === 'mesh')
    expect(selectionRing).toBeDefined()
  })
})
