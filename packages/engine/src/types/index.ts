// @Animatica/engine — Public Types
// See docs/DATA_MODELS.md for full specification

export type Vector3 = [number, number, number]
export type UUID = string

export interface Transform {
  position: Vector3
  rotation: Vector3
  scale: Vector3
}

export interface BaseActor {
  id: UUID
  name: string
  transform: Transform
  visible: boolean

  // UX Enhancements:
  locked?: boolean      // Prevents accidental selection/edits in editor
  description?: string  // For organization and accessibility/screen readers
}

// TODO: Implement remaining interfaces per DATA_MODELS.md (Jules Task 1)
