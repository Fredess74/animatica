/**
 * Utility types for the Animatica Engine.
 * @module @animatica/engine/types/utils
 */

/**
 * Represents a valid JSON primitive value.
 */
export type JSONPrimitive = string | number | boolean | null

/**
 * Represents a valid JSON array.
 */
export type JSONArray = JSONValue[]

/**
 * Represents a valid JSON object.
 */
export type JSONObject = { [member: string]: JSONValue }

/**
 * Represents any valid JSON value.
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray

/**
 * Makes all properties of an object recursive partial.
 * Useful for deep updates where only a subset of properties is provided.
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * A partial update type for discriminated unions.
 * Ensures that if the discriminator property is provided, the other properties match the corresponding union member.
 * @template T The discriminated union type.
 * @template D The discriminator key (e.g., 'type').
 */
export type DiscriminatedPartial<T, D extends keyof T> = {
  [K in T[D] & string]: Partial<Extract<T, { [P in D]: K }>>
}[T[D] & string]
