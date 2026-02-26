import { forwardRef, memo } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** The actor data containing transform, visibility, and properties. */
  actor: CharacterActor
  /** Whether the actor is currently selected in the editor. */
  isSelected?: boolean
  /** Callback for when the actor is clicked. */
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

/**
 * Renders a character actor.
 * Currently a placeholder rendering a capsule to represent the character.
 * Handles selection highlighting with an edges geometry.
 *
 * @component
 * @example
 * ```tsx
 * <CharacterRenderer actor={myCharacterActor} isSelected={true} />
 * ```
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const { transform, visible } = actor

  if (!visible) return null

  // Use a distinct color for characters, or derive from clothing if available
  // For placeholder, we use a standard color
  const color = '#ff00aa' // Hot pink for visibility

  return (
    <group
      ref={ref}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={onClick}
    >
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.5, 1.8, 4, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
        />
        {isSelected && <Edges color="yellow" threshold={15} />}
      </mesh>

      {/* Direction indicator (face) */}
      <mesh position={[0, 0.5, 0.4]} rotation={[0, 0, 0]}>
         <boxGeometry args={[0.2, 0.2, 0.2]} />
         <meshStandardMaterial color="white" />
      </mesh>
    </group>
  )
}))

CharacterRenderer.displayName = 'CharacterRenderer'
