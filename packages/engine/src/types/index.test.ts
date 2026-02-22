import { describe, it, expect } from 'vitest'
import { BaseActor } from './index'

describe('Engine Types', () => {
  it('should support UX fields in BaseActor', () => {
    const actor: BaseActor = {
      id: 'uuid-1',
      name: 'Main Actor',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      visible: true,
      // UX fields
      locked: true,
      description: 'Test description for accessibility'
    }

    expect(actor.locked).toBe(true)
    expect(actor.description).toBe('Test description for accessibility')
  })
})
