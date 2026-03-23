import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { Humanoid } from './Humanoid'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useState: (val: any) => [val, vi.fn()],
    useEffect: vi.fn(),
    useMemo: (fn: any) => fn(),
    useCallback: (fn: any) => fn,
    forwardRef: (comp: any) => {
        comp.displayName = 'ForwardRef'
        return comp
    },
    useImperativeHandle: vi.fn(),
  }
})

// Mock react-three-fiber and drei
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({
    scene: { clone: () => ({ traverse: vi.fn() }) },
    animations: [],
  })),
}))

// Mock CharacterAnimator to avoid heavy logic
vi.mock('./CharacterAnimator', () => {
  const CharacterAnimator = vi.fn()
  CharacterAnimator.prototype.registerClip = vi.fn()
  CharacterAnimator.prototype.play = vi.fn()
  CharacterAnimator.prototype.setSpeed = vi.fn()
  CharacterAnimator.prototype.update = vi.fn()
  CharacterAnimator.prototype.dispose = vi.fn()

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

describe('Humanoid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a group with correct transform', () => {
    // Testing component directly
    const result = (Humanoid as any)({
      position: [1, 2, 3],
      rotation: [0, Math.PI, 0],
      scale: [2, 2, 2],
    }, { current: null }) as any

    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([1, 2, 3])
    expect(result.props.rotation).toEqual([0, Math.PI, 0])
    expect(result.props.scale).toEqual([2, 2, 2])
  })

  it('renders procedural fallback when no URL is provided', () => {
    // Testing component directly
    const result = (Humanoid as any)({}, { current: null }) as any
    const children = React.Children.toArray(result.props.children)

    // Should contain a primitive object for the fallback rig
    const primitive = children.find((child: any) => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })

  it('renders Suspense and GLBModel when URL is provided', () => {
    // Testing component directly
    const result = (Humanoid as any)({ url: 'test.glb' }, { current: null }) as any
    const children = React.Children.toArray(result.props.children)

    // Should contain Suspense
    const suspense = children.find((child: any) => child.type === React.Suspense)
    expect(suspense).toBeDefined()
  })
})
