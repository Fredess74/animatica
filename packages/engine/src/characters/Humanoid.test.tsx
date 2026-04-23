import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Humanoid } from './Humanoid'

// Mock react to bypass hooks checks
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useMemo: (fn: any) => fn(),
    useCallback: (fn: any) => fn,
    useEffect: (fn: any) => fn(),
    useState: (val: any) => [val, vi.fn()],
    useRef: () => ({ current: null }),
    Suspense: ({ children, fallback }: any) => children || fallback,
  }
})

// Mock Three.js
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    Group: class extends actual.Group {
      clone() { return this }
    },
    Bone: class extends actual.Bone {},
    Mesh: class extends actual.Mesh {},
    SkinnedMesh: class extends actual.SkinnedMesh {},
  }
})

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(),
}))

describe('Humanoid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a procedural fallback when no URL is provided', () => {
    const result = Humanoid({ height: 1.0, build: 0.5, skinColor: '#D4A27C' }) as any

    expect(result.type).toBe('primitive')
    expect(result.props.object).toBeDefined()
    // It should be the procedural rig root
    const object = result.props.object as any
    expect(object.type).toBe('Group')
  })

  it('triggers onLoad when rendering procedural fallback', () => {
    const onLoad = vi.fn()
    Humanoid({ onLoad })
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({
      root: expect.any(Object),
      bones: expect.any(Map),
    }))
  })

  it('renders Suspendable model when a URL is provided', () => {
    const result = Humanoid({ url: 'test.glb' }) as any
    // In our mocked Suspense, it returns the children
    expect(result).toBeDefined()
  })
})
