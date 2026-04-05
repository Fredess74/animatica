import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock React to handle forwardRef/memo and hooks in a test-friendly way
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    // When components are wrapped in memo(forwardRef),
    // the test access .type.render. We mock forwardRef to return a shape
    // that exposes the render function directly.
    forwardRef: (render: any) => ({ render, type: { render } }),
    memo: (comp: any) => comp,
    useRef: (val: any) => ({ current: val }),
    useMemo: (factory: any) => factory(),
    useImperativeHandle: () => {},
    useEffect: () => {},
    useLayoutEffect: () => {},
    useCallback: (fn: any) => fn,
    useState: (val: any) => [val, vi.fn()],
  }
})

// Mock @react-three/fiber hooks
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

  it('renders a group containing the character rig', () => {
    // Access the render function of the forwardRef component
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children - should contain a primitive for the rig and a selection ring (if selected)
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child is the <primitive object={rig.root} />
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect((rigPrimitive.props as any).object).toBeDefined()
  })

  it('handles visibility correctly', () => {
    // Note: Per architectural memory, visibility is handled via the visible prop on the group
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null) as any

    expect(result).not.toBeNull()
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when selected', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing).toBeDefined()
    expect((selectionRing as any).type).toBe('mesh')

    const ringProps = (selectionRing as any).props
    expect(ringProps.position).toEqual([0, 0.01, 0])
  })
})
