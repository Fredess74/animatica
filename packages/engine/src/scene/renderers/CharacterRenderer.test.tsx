import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useMemo: (factory: () => any) => factory(),
    useEffect: () => {},
    useImperativeHandle: () => {},
    memo: (c: any) => c,
    forwardRef: (c: any) => {
        c.render = c
        return c
    },
  }
})

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}))

// Mock CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn().mockReturnValue({
    root: { name: 'rig-root' },
    bodyMesh: {},
    morphTargetMap: {}
  })
}))

// Mock CharacterAnimator
vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
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

  it('renders a group containing primitive rig with correct transform', () => {
    // Call the component function directly
    const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // First child should be the primitive rig
    const primitive = children[0] as React.ReactElement
    expect(primitive.type).toBe('primitive')
    expect(primitive.props.object.name).toBe('rig-root')
  })

  it('applies visibility from prop', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement
    expect(result.props.visible).toBe(false)
  })
})
