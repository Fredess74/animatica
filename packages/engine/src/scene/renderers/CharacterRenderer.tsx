/**
 * CharacterRenderer — High-level renderer that orchestrates the Humanoid component
 * with additional selection UI and logic.
 */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FaceMorphController } from '../../character/FaceMorphController'
import { EyeController } from '../../character/EyeController'
import { Humanoid } from '../../character/Humanoid'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: () => void
}

/**
 * CharacterRenderer — High-level renderer that orchestrates the Humanoid component
 * with additional selection UI and logic.
 */
export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  actor,
  isSelected = false,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Update stateful controllers (morph targets, eyes)
  useFrame((_state, delta) => {
    if (faceMorphRef.current) {
      // Handle morph target overrides from store if any
      if (actor.morphTargets) {
        faceMorphRef.current.setTarget(actor.morphTargets as any)
      }
      faceMorphRef.current.update(delta)
    }

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
      <Humanoid
        actor={actor}
        onLoad={(rig) => {
          // Setup face morph controller
          faceMorphRef.current = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
          // Setup eye controller
          eyeControllerRef.current = new EyeController()
        }}
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
}
