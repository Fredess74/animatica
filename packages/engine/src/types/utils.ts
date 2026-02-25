/**
 * Utility types for the Animatica Engine.
 * This module exports helper types for type hardening and strictness.
 * @module @animatica/engine/types/utils
 */

/**
 * Make all properties in T readonly, recursively.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * Make all properties in T mutable, recursively.
 * Useful for when you need to modify a readonly object (e.g. in Immer draft).
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Mutable<T[P]> : T[P]
}

/**
 * Make specific properties in T optional.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific properties in T required.
 */
export type RequiredProps<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * Extract the value type of a Record or Map.
 */
export type ValueOf<T> = T[keyof T]

/**
 * A type that can be null or undefined.
 */
export type Nullable<T> = T | null | undefined
