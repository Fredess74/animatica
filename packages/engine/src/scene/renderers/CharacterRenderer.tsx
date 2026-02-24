import { forwardRef } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { CharacterActor } from '../../types'
import { Humanoid } from '../../characters/Humanoid'

interface CharacterRendererProps {
  /** The actor data containing transform, visibility, and properties. */
  actor: CharacterActor
  /** Whether the actor is currently selected in the editor. */
  isSelected?: boolean
  /** Callback for when the actor is clicked. */
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

/** Default ReadyPlayerMe model URL to use if none is specified in the actor. */
const DEFAULT_MODEL_URL = 'https://models.readyplayer.me/6585bb73602f9e42152862a9.glb';

/**
 * Renders a character actor using the Humanoid component.
 * Handles model loading from URL, animations, and selection highlighting.
 *
 * @component
 * @example
 * ```tsx
 * <CharacterRenderer actor={myCharacterActor} isSelected={true} />
 * ```
 */
export const CharacterRenderer = forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const { transform, visible, animation, animationSpeed, modelUrl, morphTargets, bodyPose } = actor

  if (!visible) return null

  return (
    <group
      ref={ref}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={onClick}
    >
      <Humanoid
        url={modelUrl || DEFAULT_MODEL_URL}
        animation={animation}
        animationSpeed={animationSpeed}
        morphTargets={morphTargets}
        bodyPose={bodyPose}
      />
      {isSelected && (
        <mesh>
          <capsuleGeometry args={[0.5, 1.8, 4, 8]} />
          <meshStandardMaterial transparent opacity={0} />
          <Edges color="yellow" threshold={15} />
        </mesh>
      )}
    </group>
  )
})

CharacterRenderer.displayName = 'CharacterRenderer'
