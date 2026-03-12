/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Orchestrates character actors by delegating rigging and animation to the <Humanoid /> component.
 */
import { memo, forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { Humanoid } from '../../character/Humanoid'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** The character actor data. */
  actor: CharacterActor
  /** Whether the actor is currently selected in the editor. */
  isSelected?: boolean
  /** Callback for when the actor is clicked. */
  onClick?: () => void
}

/**
 * CharacterRenderer — High-level character component.
 * Handles selection state, visibility-based early returns (after hooks),
 * and exposes the internal group ref.
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)

  // Expose the internal group ref to the parent
  useImperativeHandle(ref, () => groupRef.current!)

  return (
    <group
      ref={groupRef}
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
      {/* Humanoid body and animation delegation */}
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
}))

CharacterRenderer.displayName = 'CharacterRenderer'
