import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterAnimator to avoid issues with THREE.AnimationMixer etc. in test env
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    update: vi.fn(),
    setSpeed: vi.fn(),
    dispose: vi.fn(),
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn(),
  createRunClip: vi.fn(),
  createTalkClip: vi.fn(),
  createWaveClip: vi.fn(),
  createDanceClip: vi.fn(),
  createSitClip: vi.fn(),
  createJumpClip: vi.fn(),
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

  it('renders a group with correct transform and rig primitive', () => {
    // Call the component as a function to inspect returned JSX
    // Since it's wrapped in memo, we access the underlying function via .type
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
    expect(props.visible).toBe(true)

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the primitive for the rig root
    const rigPrimitive = children[0]
    expect(rigPrimitive.type).toBe('primitive')
    expect((rigPrimitive.props as any).object).toBeDefined()
  })

  it('renders a group with visible false when actor.visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: invisibleActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')
    expect((result.props as any).visible).toBe(false)
  })

  it('renders selection ring when isSelected is true', () => {
    const Component = (CharacterRenderer as any).type;
    const result = Component({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Should have two children: rig primitive and selection ring mesh
    expect(children.length).toBe(2)
    const selectionRing = children[1]
    expect(selectionRing.type).toBe('mesh')
  })
})
