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
    useMemo: (factory: any) => factory(),
    useEffect: () => {},
    useCallback: (cb: any) => cb,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn()
}))

// Mock CharacterAnimator to avoid constructor/logic issues during render test
vi.mock('../../character/CharacterAnimator', () => {
    return {
        CharacterAnimator: vi.fn().mockImplementation(() => ({
            registerClip: vi.fn(),
            play: vi.fn(),
            update: vi.fn(),
            dispose: vi.fn(),
            setSpeed: vi.fn()
        })),
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

  it('renders a group with correct transform', () => {
    // @ts-ignore
    const Component = CharacterRenderer.type || CharacterRenderer
    const result = Component({ actor: mockActor }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify rig root is present as primitive
    const children = React.Children.toArray(props.children) as React.ReactElement[]
    const rigPrimitive = children.find(c => c.type === 'primitive')
    expect(rigPrimitive).toBeDefined()
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const Component = CharacterRenderer.type || CharacterRenderer
    const result = Component({ actor: mockActor, isSelected: true }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Selection indicator is a mesh with ringGeometry
    const selectionMesh = children.find(c => c.type === 'mesh' && (React.Children.toArray((c.props as any).children).some((gc: any) => gc.type === 'ringGeometry')))
    expect(selectionMesh).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const Component = CharacterRenderer.type || CharacterRenderer
    const result = Component({ actor: invisibleActor })
    expect(result).toBeNull()
  })
})
