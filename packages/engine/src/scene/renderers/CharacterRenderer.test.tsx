import { describe, it, expect, vi, afterEach } from 'vitest'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: () => ({ current: null }),
    useImperativeHandle: () => {},
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useFrame: () => {},
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Humanoid component
vi.mock('../../character/Humanoid', () => ({
  Humanoid: () => <primitive object={{}} name="humanoid" />
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

  it('renders a group containing Humanoid with correct transform', () => {
    // @ts-ignore
    const result = (CharacterRenderer as any).type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = Array.isArray(props.children) ? props.children : [props.children]
    const humanoid = children.find((c: any) => c.type.name === 'Humanoid' || c.props.name === 'humanoid')
    expect(humanoid).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = (CharacterRenderer as any).type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })
})
