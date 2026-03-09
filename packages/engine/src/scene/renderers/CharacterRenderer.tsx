/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Orchestrates the character's 3D representation using the Humanoid component
 * and handles editor-specific features like selection rings.
 */
import React, { memo } from 'react'
import * as THREE from 'three'
import { Humanoid } from '../../character/Humanoid'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** The character actor data. */
  actor: CharacterActor
  /** Whether the character is currently selected in the editor. */
  isSelected?: boolean
  /** Callback triggered when the character is clicked. */
  onClick?: () => void
}

/**
 * CharacterRenderer — Orchestrates character rendering.
 * Delegates actual 3D loading and animation to the Humanoid component.
 *
 * @component
 */
export const CharacterRenderer: React.FC<CharacterRendererProps> = memo(({
  actor,
  isSelected = false,
  onClick,
}) => {
  if (!actor.visible) return null

  return (
    <group
      name={actor.id}
      position={actor.transform.position}
      rotation={actor.transform.rotation}
      scale={actor.transform.scale}
      visible={actor.visible}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {/* 3D Character (GLB or Procedural) */}
      <Humanoid actor={actor} />

      {/* Selection indicator ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial
            color="#22C55E"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
})

CharacterRenderer.displayName = 'CharacterRenderer'
