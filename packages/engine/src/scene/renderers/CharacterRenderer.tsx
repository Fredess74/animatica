/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Orchestrates character actors by delegating rigging and animation to the <Humanoid /> component.
 */
import React, { useImperativeHandle, forwardRef, memo, useRef } from 'react'
import * as THREE from 'three'
import { Humanoid } from '../../character/Humanoid'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** The character actor data. */
  actor: CharacterActor
  /** Whether the actor is currently selected in the editor. */
  isSelected?: boolean
  /** Callback when the actor is clicked in the viewport. */
  onClick?: () => void
}

/**
 * CharacterRenderer component.
 * Handles selection state, visibility, and transform, while delegating model rendering to Humanoid.
 */
export const CharacterRenderer = memo(
  forwardRef<THREE.Group, CharacterRendererProps>(({ actor, isSelected = false, onClick }, ref) => {
    const groupRef = useRef<THREE.Group>(null)

    // Expose the internal group ref to the parent via forwardRef
    useImperativeHandle(ref, () => groupRef.current!)

    if (!actor.visible) return null

    return (
      <group
        ref={groupRef}
        name={actor.id}
        position={actor.transform.position}
        rotation={actor.transform.rotation}
        scale={actor.transform.scale}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
      >
        {/* Delegate humanoid rendering (GLB or Procedural) */}
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
)

CharacterRenderer.displayName = 'CharacterRenderer'
