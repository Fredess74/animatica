import { describe, it, expect } from 'vitest'
import {
  PrimitiveActor,
  Vector3,
  Keyframe,
  DeepPartial
} from './index'

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

  it('should allow generic types on Keyframe values', () => {
    const kf: Keyframe<number> = {
        time: 0,
        value: 10,
        easing: 'linear'
    }
    expect(kf.value).toBe(10)

    const kfObj: Keyframe<{ x: number }> = {
        time: 1,
        value: { x: 10 }
    }
    expect(kfObj.value.x).toBe(10)
  })

  it('should verify Vector3 shape', () => {
     const v: Vector3 = [1, 2, 3]
     expect(v[0]).toBe(1)
     expect(v.length).toBe(3)
  })

  it('should support DeepPartial for updates', () => {
      const update: DeepPartial<PrimitiveActor> = {
          transform: {
              position: [1, 2, 3]
          },
          properties: {
              color: '#00ff00'
          }
      }
      expect(update.transform?.position).toEqual([1, 2, 3])
  })
})
