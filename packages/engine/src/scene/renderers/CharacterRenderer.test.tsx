import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react hooks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    useEffect: vi.fn(),
  }
})

// Mock R3F useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock CharacterAnimator to avoid errors during initialization
vi.mock('../../character/CharacterAnimator', () => {
  const CharacterAnimator = vi.fn()
  CharacterAnimator.prototype.registerClip = vi.fn()
  CharacterAnimator.prototype.play = vi.fn()
  CharacterAnimator.prototype.update = vi.fn()
  CharacterAnimator.prototype.dispose = vi.fn()
  CharacterAnimator.prototype.setSpeed = vi.fn()

  return {
    CharacterAnimator,
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
  }
})

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
    // @ts-ignore - CharacterRenderer is a memoized component
    const render = CharacterRenderer.type
    const result = render({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children contains primitive for rig root
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const primitive = children.find(child => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('sets visibility prop correctly', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const render = CharacterRenderer.type
    const result = render({ actor: invisibleActor }) as React.ReactElement
    expect(result.props.visible).toBe(false)
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const render = CharacterRenderer.type
    const result = render({ actor: mockActor, isSelected: true }) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    // The selection indicator is the second child (mesh with ringGeometry)
    const ring = children.find(child =>
      child.type === 'mesh' &&
      React.Children.toArray((child.props as any).children).some((c: any) => c.type === 'ringGeometry')
    )
    expect(ring).toBeDefined()
  })
})
