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
    // Mock memo to just return the component
    memo: (comp: any) => comp,
    // Mock forwardRef to return the component and add .render for access
    forwardRef: (comp: any) => {
      const fn = (props: any, ref: any) => comp(props, ref);
      fn.render = comp;
      return fn;
    }
  }
})

// Mock Humanoid component
vi.mock('../../character/Humanoid', () => ({
  Humanoid: (props: any) => <div data-testid="humanoid" {...props} />
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
    const result = CharacterRenderer.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    // Verify children
    const children = React.Children.toArray(props.children) as React.ReactElement[]

    // Child should be the Humanoid component
    const humanoid = children[0]
    expect(humanoid.type).toBeDefined()
    expect(humanoid.props.actor).toEqual(mockActor)
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('triggers onClick when clicked', () => {
    const onClick = vi.fn()
    // @ts-ignore
    const result = CharacterRenderer.render({ actor: mockActor, onClick }, null) as React.ReactElement
    const props = result.props as any

    // Simulate click
    const event = { stopPropagation: vi.fn() }
    props.onClick(event)

    expect(onClick).toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalled()
  })
})
