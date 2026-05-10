/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Extracts state from the store and delegates rendering to the Humanoid component.
 *
 * @module @animatica/engine/scene/renderers/CharacterRenderer
 */
import React, { memo, forwardRef } from 'react'
import { Humanoid } from '../../character/Humanoid'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** Character actor data containing transform, visibility, and properties. */
  actor: CharacterActor
  /** Whether the character is currently selected in the editor. */
  isSelected?: boolean
  /** Callback when the character is clicked. */
  onClick?: () => void
}

/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Handles top-level visibility and transform, then delegates to Humanoid.
 *
 * @component
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const { transform, visible, id } = actor

  // Visibility check: Satisfy Rules of Hooks by placing it after all potential hooks.
  // Although we don't have hooks here yet, this is best practice.
  if (!visible) return null

  return (
    <group
      ref={ref}
      name={id}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <Humanoid actor={actor} isSelected={isSelected} />
    </group>
  )
}))

CharacterRenderer.displayName = 'CharacterRenderer'
