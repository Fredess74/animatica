import { forwardRef } from 'react'
import { SpeakerActor } from '../../types'
import { PositionalAudio } from '@react-three/drei'
import * as THREE from 'three'

interface SpeakerRendererProps {
  /** The speaker actor data. */
  actor: SpeakerActor
  /** Whether to show the visual helper (gizmo). */
  showHelper?: boolean
}

/**
 * Renders a speaker (audio source) visualization.
 * Uses PositionalAudio for 3D sound if an audio URL is provided.
 *
 * @component
 */
export const SpeakerRenderer = forwardRef<THREE.Group, SpeakerRendererProps>(({
  actor,
  showHelper = false,
}, ref) => {
  const { transform, visible, properties } = actor

  if (!visible) return null

  return (
    <group
      ref={ref}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    >
      {/* Visual Helper */}
      {showHelper && (
        <mesh data-testid="speaker-helper">
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="orange" wireframe />
        </mesh>
      )}

      {/* Audio Source */}
      {properties.audioUrl && (
        <PositionalAudio
          url={properties.audioUrl}
          distance={10} // Default distance
          loop={properties.loop}
          // spatial prop is handled by PositionalAudio being 3D by default
        />
      )}
    </group>
  )
})

SpeakerRenderer.displayName = 'SpeakerRenderer'
