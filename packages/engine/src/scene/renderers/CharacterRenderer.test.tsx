import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
// @ts-ignore
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react to bypass hooks checks when calling component directly
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  const useMemo = (factory: any) => factory()
  const useRef = () => ({ current: null })
  const useEffect = () => {}
  const useLayoutEffect = () => {}
  const useCallback = (callback: any) => callback
  const useImperativeHandle = () => {}

  return {
    ...actual,
    useRef,
    useMemo,
    useEffect,
    useLayoutEffect,
    useCallback,
    useImperativeHandle,
    default: {
      ...actual,
      useRef,
      useMemo,
      useEffect,
      useLayoutEffect,
      useCallback,
      useImperativeHandle,
    }
  }
})

// Mock the Edges component from @react-three/drei
vi.mock('@react-three/drei', () => ({
  Edges: () => null
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
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

  it('renders a group with correct transform', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, { current: null })
    expect(result).toBeNull()
  })

  it('contains the character rig root', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor }, { current: null }) as React.ReactElement
    const props = result.props as any
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    const primitive = children.find(child => child.type === 'primitive')
    expect(primitive).toBeDefined()
  })
})
