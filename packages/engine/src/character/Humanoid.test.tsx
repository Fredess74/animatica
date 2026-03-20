import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import * as THREE from 'three'
import { Humanoid } from './Humanoid'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (fn: any) => fn(),
    useEffect: () => {},
    useImperativeHandle: () => {},
  }
})

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

// Mock Drei hooks
const mockUseGLTF = vi.fn()
vi.mock('@react-three/drei', () => ({
  useGLTF: (url: string) => mockUseGLTF(url),
}))

// Mock controllers
vi.mock('./CharacterAnimator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./CharacterAnimator')>()
  return {
    ...actual,
    CharacterAnimator: vi.fn().mockImplementation(function() {
      return {
        registerClip: vi.fn(),
        play: vi.fn(),
        setSpeed: vi.fn(),
        update: vi.fn(),
        dispose: vi.fn(),
      }
    }),
  }
})

vi.mock('./FaceMorphController', () => ({
  FaceMorphController: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    setImmediate: vi.fn(),
    update: vi.fn(),
  })),
}))

vi.mock('./EyeController', () => ({
  EyeController: vi.fn().mockImplementation(() => ({
    update: vi.fn().mockReturnValue({}),
  })),
}))

describe('Humanoid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGLTF.mockReturnValue({ scene: null, animations: [] })
  })

  it('renders a procedural humanoid when no URL is provided', () => {
    // @ts-ignore
    const result = Humanoid.type.render({}, null) as React.ReactElement

    expect(result.type).toBe('group')
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const primitive = children.find(c => c.type === 'primitive')
    expect(primitive).toBeDefined()
    expect(primitive?.props.object).toBeInstanceOf(THREE.Group)
  })

  it('renders GLB scene when URL is provided', () => {
    const mockScene = new THREE.Group()
    mockUseGLTF.mockReturnValue({ scene: mockScene, animations: [] })

    // @ts-ignore
    const result = Humanoid.type.render({ url: 'test.glb' }, null) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const primitive = children.find(c => c.type === 'primitive')
    expect(primitive?.props.object).toBeInstanceOf(THREE.Group)
    expect(primitive?.props.object).not.toBe(mockScene)
  })
})
