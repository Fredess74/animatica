/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Orchestrates the character rig (Humanoid), animations, facial expressions, and eye tracking.
 */
import { useEffect, useRef, memo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FaceMorphController } from '../../character/FaceMorphController'
import { EyeController } from '../../character/EyeController'
import { getPreset } from '../../character/CharacterPresets'
import { Humanoid } from '../../character/Humanoid'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: () => void
}

/**
 * Renders a character actor using the Humanoid component.
 * Manages higher-level character systems like facial expressions and eye tracking
 * that sit on top of the base skeletal rig.
 */
export const CharacterRenderer: React.FC<CharacterRendererProps> = memo(forwardRef(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  useImperativeHandle(ref, () => groupRef.current)

  // Get preset for procedural fallback parameters
  const preset = getPreset(actor.name.toLowerCase())
  const skinColor = preset?.body.skinColor || '#D4A27C'
  const height = preset?.body.height || 1.0
  const build = preset?.body.build || 0.5

  // Setup auxiliary controllers when the rig is available
  // Note: FaceMorphController needs access to the mesh and morph dictionary
  // which are currently inside the Humanoid component.
  // For Phase 2, we keep simplified logic here or extend Humanoid to expose them.

  useEffect(() => {
    // eyeController is standalone
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController
  }, [])

  // React to morph target / expression changes
  useEffect(() => {
    if (faceMorphRef.current && actor.morphTargets) {
      faceMorphRef.current.setTarget(actor.morphTargets as any)
    }
  }, [actor.morphTargets])

  // Frame update — face morphs, eye blinks
  useFrame((_state, delta) => {
    // Face morph blending
    if (faceMorphRef.current) {
      faceMorphRef.current.update(delta)
    }

    // Eye auto-blink + look-at
    if (eyeControllerRef.current && faceMorphRef.current) {
      const headPos = groupRef.current
        ? new THREE.Vector3().setFromMatrixPosition(groupRef.current.matrixWorld)
        : undefined
      const eyeValues = eyeControllerRef.current.update(delta, headPos)
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

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
      {/* The base humanoid rig (GLB or Procedural) */}
      <Humanoid
        url={actor.modelUrl}
        animation={actor.animation as any}
        animationSpeed={actor.animationSpeed}
        skinColor={skinColor}
        height={height}
        build={build}
      />

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
