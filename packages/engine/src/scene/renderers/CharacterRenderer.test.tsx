import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks and complex logic
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
    // Just don't mock forwardRef/memo or mock them very carefully
  }
})

// Mock @react-three/fiber
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

  it('renders a group containing the character rig', () => {
    // Access the render function directly from the memo/forwardRef component
    // @ts-ignore
    const render = CharacterRenderer.type.render
    const result = render({ actor: mockActor }, null) as any

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // The character rig is rendered via <primitive object={rig.root} />
    const rigPrimitive = children.find(c => (c as any).type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('handles visibility correctly via props', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const render = CharacterRenderer.type.render
    const result = render({ actor: invisibleActor }, null) as any
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const render = CharacterRenderer.type.render
    const result = render({ actor: mockActor, isSelected: true }, null) as any
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const selectionIndicator = children.find(c => (c as any).type === 'mesh')
    expect(selectionIndicator).toBeDefined()

    const indicatorProps = selectionIndicator?.props as any
    const meshChildren = React.Children.toArray(indicatorProps.children)

    expect(meshChildren.some((c: any) => (c as any).type === 'ringGeometry')).toBe(true)
    expect(meshChildren.some((c: any) => (c as any).type === 'meshBasicMaterial' && (c as any).props.color === '#22C55E')).toBe(true)
  })
})
