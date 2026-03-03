// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock CharacterLoader and controllers since they use THREE and logic not needed for structure test
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: { type: 'Group', isObject3D: true, children: [] },
    bodyMesh: null,
    morphTargetMap: {}
  }))
}))

vi.mock('../../character/CharacterAnimator', () => ({
  CharacterAnimator: vi.fn(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn()
  })),
  createIdleClip: vi.fn(),
  createWalkClip: vi.fn()
}))

vi.mock('../../character/FaceMorphController', () => ({
  FaceMorphController: vi.fn(() => ({
    update: vi.fn(),
    setTarget: vi.fn(),
    setImmediate: vi.fn()
  }))
}))

vi.mock('../../character/EyeController', () => ({
  EyeController: vi.fn(() => ({
    update: vi.fn()
  }))
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
    useEffect: vi.fn(),
    useMemo: vi.fn((factory: any) => factory()),
    useCallback: vi.fn((cb: any) => cb),
    useImperativeHandle: vi.fn(),
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

  it('renders correctly when visible', () => {
    // @ts-ignore - access internal render function of forwardRef(memo())
    const result = (CharacterRenderer as any).type.render({ actor: mockActor }, null)

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([10, 0, 5])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = (CharacterRenderer as any).type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })
})
