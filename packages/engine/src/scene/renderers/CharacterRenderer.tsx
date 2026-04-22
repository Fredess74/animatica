/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Creates a procedural humanoid (or loads GLB), applies animation, face morphs, and eye tracking.
 */
import React, { useEffect, useRef, memo, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Humanoid } from '../../character/Humanoid'
import { FaceMorphController } from '../../character/FaceMorphController'
import { EyeController } from '../../character/EyeController'
import { getPreset } from '../../character/CharacterPresets'
import type { CharacterActor } from '../../types'
import type { CharacterRig } from '../../character/CharacterLoader'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: () => void
}

/**
 * CharacterRenderer — R3F component for rendering a character actor.
 *
 * @component
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Expose groupRef to parent via forwardRef
  useImperativeHandle(ref, () => groupRef.current as THREE.Group)

  // Look up preset for customization
  const preset = useMemo(() => getPreset(actor.name.toLowerCase()), [actor.name])

  // Handle rig loading and setup controllers
  const handleRigLoad = useCallback((rig: CharacterRig) => {
    // Setup face morph controller
    if (rig.bodyMesh) {
      const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
      faceMorphRef.current = faceMorph
    }

    // Setup eye controller
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
      // Apply eye morph values on top of expression
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

  // Rule of Hooks: Place conditional return after all hooks
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
      <Humanoid
        animation={actor.animation}
        animationSpeed={actor.animationSpeed}
        height={preset?.body.height}
        build={preset?.body.build}
        skinColor={preset?.body.skinColor}
        onLoad={handleRigLoad}
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

      {/* Face direction indicator (for editor) */}
      <mesh position={[0, 1.5, 0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.2]} />
        <meshBasicMaterial color="#22C55E" />
      </mesh>
    </group>
  )
}))

CharacterRenderer.displayName = 'CharacterRenderer'
