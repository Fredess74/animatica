import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useRef: (initialValue: any) => ({ current: initialValue }),
    useImperativeHandle: () => {},
  }
})

// Mock dependencies
vi.mock('../../character/Humanoid', () => ({
  Humanoid: (props: any) => React.createElement('humanoid', props)
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
    const result = CharacterRenderer.type.render({ actor: mockActor }, null) as React.ReactElement

    expect(result).not.toBeNull()
    expect(result.type).toBe('group')

    const props = result.props as any
    expect(props.position).toEqual([10, 0, 5])
    expect(props.rotation).toEqual([0, Math.PI, 0])
    expect(props.scale).toEqual([1, 1, 1])

    const children = React.Children.toArray(props.children)
    // Find the humanoid element - check if it's there
    expect(children.length).toBeGreaterThan(0)

    const humanoid = children.find((c: any) => {
        // If it's a React element, it has a type
        return c.type === 'humanoid' || c.type?.name === 'Humanoid'
    })

    // If we can't find it by type, let's see what's in there
    if (!humanoid) {
        // console.log('Children:', children.map(c => typeof c === 'object' ? (c as any).type : c))
    }

    expect(humanoid).toBeDefined()
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
    expect(result).toBeNull()
  })

  it('renders selection indicator when isSelected is true', () => {
    // @ts-ignore
    const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null) as React.ReactElement
    const children = React.Children.toArray(result.props.children) as React.ReactElement[]

    const selectionRing = children.find((child: any) => child.type === 'mesh')
    expect(selectionRing).toBeDefined()
  })
})
