import { describe, it, expect, vi, afterEach } from 'vitest'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import { ReactElement } from 'react'

// Mock react
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    memo: (c: any) => c,
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
    const result = CharacterRenderer({ actor: mockActor }) as ReactElement

    expect(result).not.toBeNull()
    expect(result?.type).toBe('group')

    const props = result?.props as any
    expect(props?.position).toEqual([10, 0, 5])
    expect(props?.rotation).toEqual([0, Math.PI, 0])
    expect(props?.scale).toEqual([1, 1, 1])
  })

  it('renders nothing when visible is false', () => {
    const invisibleActor = { ...mockActor, visible: false }
    // @ts-ignore
    const result = CharacterRenderer({ actor: invisibleActor })
    expect(result).toBeNull()
  })
})
