import { describe, it, expect } from 'vitest'
import {
  AnimationState,
  Keyframe,
  Clip,
  DeepReadonly,
  Mutable
} from './index'

describe('Types', () => {
  describe('AnimationState', () => {
    it('should accept known states', () => {
      const state: AnimationState = 'idle'
      expect(state).toBe('idle')
    })

    it('should accept custom strings', () => {
      const state: AnimationState = 'custom-dance'
      expect(state).toBe('custom-dance')
    })
  })

  describe('Keyframe', () => {
    it('should support generic types', () => {
      const numberKeyframe: Keyframe<number> = {
        time: 0,
        value: 10,
        easing: 'linear'
      }
      expect(numberKeyframe.value).toBe(10)

      const stringKeyframe: Keyframe<string> = {
        time: 1,
        value: 'hello'
      }
      expect(stringKeyframe.value).toBe('hello')
    })
  })

  describe('Clip', () => {
    it('should define a clip structure', () => {
      const clip: Clip = {
        id: '123',
        name: 'test-clip',
        duration: 5,
        url: 'http://example.com',
        type: 'audio'
      }
      expect(clip.id).toBe('123')
    })
  })

  describe('DeepReadonly', () => {
    it('should allow nested property access', () => {
      const obj = {
        a: 1,
        b: { c: 2 }
      }
      const readonlyObj: DeepReadonly<typeof obj> = obj
      expect(readonlyObj.b.c).toBe(2)
      // Mutations would fail at compile time
    })
  })

  describe('Mutable', () => {
    it('should allow mutation', () => {
      type ReadonlyObj = { readonly a: number }
      const obj: Mutable<ReadonlyObj> = { a: 1 }
      obj.a = 2
      expect(obj.a).toBe(2)
    })
  })
})
