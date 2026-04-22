import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import { Humanoid } from '../../character/Humanoid'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val || null }),
    useImperativeHandle: vi.fn(),
    useEffect: vi.fn(),
    useMemo: (fn: any) => fn(),
    useCallback: (fn: any) => fn,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Humanoid component
vi.mock('../../character/Humanoid', () => ({
  Humanoid: ({ children }: any) => <primitive object={{ name: 'humanoid-root' }}>{children}</primitive>
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
    animationSpeed: 1,
    morphTargets: {},
    bodyPose: {},
    clothing: {}
  }

  it('renders a group containing Humanoid and indicators', () => {
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

    // First child should be Humanoid
    const humanoid = children[0]
    expect(humanoid.type).toBe(Humanoid)
    expect(humanoid.props.animation).toBe('idle')

    // Third child (index 2 since second is conditional selection ring) is the face indicator
    // In this case, selection ring is not rendered, so second child is face indicator
    const faceIndicator = children[1]
    expect(faceIndicator.type).toBe('mesh')
    expect(faceIndicator.props.position).toEqual([0, 1.5, 0.4])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // With isSelected: true, second child is selection ring mesh
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')
    expect(selectionRing.props.position).toEqual([0, 0.01, 0])
  })
})
