import { describe, it, expect } from 'vitest'
import { PrimitiveActor } from './index'

describe('Types', () => {
  it('should support UX enhancements on Actor', () => {
    const actor: PrimitiveActor = {
      id: '123',
      name: 'Test Actor',
      type: 'primitive',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      visible: true,
      properties: {
        shape: 'box',
        color: '#ff0000',
        roughness: 0.5,
        metalness: 0.5,
        opacity: 1,
        wireframe: false
      },
      // UX Enhancements
      locked: true,
      description: 'A locked test actor'
    }

    expect(actor.locked).toBe(true)
    expect(actor.description).toBe('A locked test actor')
  })
})
