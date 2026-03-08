// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Humanoid } from './Humanoid'
import * as THREE from 'three'

// Mock react to bypass hooks checks in unit tests
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (val: any) => ({ current: val }),
    useMemo: (fn: any) => fn(),
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    Suspense: ({ children, fallback }: any) => <>{children || fallback}</>,
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({
    scene: new THREE.Group(),
    animations: [],
  })),
}))

// Mock internal character modules
vi.mock('./CharacterAnimator', () => ({
  CharacterAnimator: vi.fn().mockImplementation(() => ({
    registerClip: vi.fn(),
    play: vi.fn(),
    setSpeed: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
  createIdleClip: vi.fn(() => ({ name: 'idle' })),
}))

describe('Humanoid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    // Basic test to ensure it doesn't crash
    const result = Humanoid({ animation: 'idle' })
    expect(result).toBeDefined()
  })
})
