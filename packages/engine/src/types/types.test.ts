import { describe, it, expectTypeOf } from 'vitest'
import { DeepReadonly, Mutable, Optional, RequiredProps, Nullable } from './utils'
import { Vector3, Transform, Actor, PrimitiveActor } from './index'

describe('Utility Types', () => {
  it('should support DeepReadonly', () => {
    type TestType = {
      foo: string
      bar: {
        baz: number
      }
    }
    type ReadonlyTestType = DeepReadonly<TestType>

    expectTypeOf<ReadonlyTestType>().toHaveProperty('foo').toBeString()
    expectTypeOf<ReadonlyTestType['bar']>().toHaveProperty('baz').toBeNumber()
  })

  it('should support Mutable', () => {
    type ReadonlyType = {
      readonly foo: string
      readonly bar: {
        readonly baz: number
      }
    }
    type MutableType = Mutable<ReadonlyType>

    expectTypeOf<MutableType>().toHaveProperty('foo')
  })

  it('should support Optional', () => {
    type TestType = {
      foo: string
      bar: number
    }
    type OptionalFoo = Optional<TestType, 'foo'>

    expectTypeOf<OptionalFoo>().toHaveProperty('bar').toBeNumber()
  })

  it('should support RequiredProps', () => {
    type TestType = {
      foo?: string
      bar?: number
    }
    type RequiredFoo = RequiredProps<TestType, 'foo'>

    expectTypeOf<RequiredFoo>().toHaveProperty('foo').toBeString()
  })

  it('should support Nullable', () => {
    type TestType = string
    type NullableTestType = Nullable<TestType>

    expectTypeOf<NullableTestType>().toEqualTypeOf<string | null | undefined>()
  })
})

describe('Core Types', () => {
  it('should enforce Vector3 structure', () => {
    // Vector3 is now mutable [number, number, number] to support Immer compatibility
    expectTypeOf<Vector3>().toEqualTypeOf<[number, number, number]>()
  })

  it('should enforce Transform structure', () => {
    expectTypeOf<Transform>().toHaveProperty('position')
    expectTypeOf<Transform>().toHaveProperty('rotation')
    expectTypeOf<Transform>().toHaveProperty('scale')
  })

  it('should enforce Actor union', () => {
    // PrimitiveActor is assignable to Actor (Actor is a union containing PrimitiveActor)
    expectTypeOf<PrimitiveActor>().toMatchTypeOf<Actor>()
  })
})
