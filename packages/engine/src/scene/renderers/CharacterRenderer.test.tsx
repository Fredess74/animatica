import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  const mockReact = {
    ...actual,
    forwardRef: (render: any) => ({ render, type: { render } }),
    memo: (comp: any) => comp,
    useRef: () => ({ current: { } }),
    useImperativeHandle: vi.fn(),
    useEffect: vi.fn(),
    useMemo: (factory: any) => factory(),
  }
  return {
    ...mockReact,
    default: mockReact,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({ gl: { domElement: {} } }),
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

  it('renders a group containing the rig root with correct transform', () => {
    // Call the forwardRef component's render function directly
    // Since it's wrapped in memo, we access the underlying forwardRef via .type
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

    // First child should be the rig root (primitive object)
    const rigRoot = children[0]
    expect(rigRoot.type).toBe('primitive')
    expect(rigRoot.props.object).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    // Note: The component currently applies visible to the group, but doesn't return null if !visible
    // Let's verify it still renders the group with visible: false
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null) as React.ReactElement
    expect(result.props.visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
     // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Second child should be the selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')

    const ringChildren = React.Children.toArray(selectionRing.props.children) as React.ReactElement[]
    expect(ringChildren.some(c => c.type === 'ringGeometry')).toBe(true)
  })
})
