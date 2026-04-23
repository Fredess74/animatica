/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * delegates core humanoid rendering to the Humanoid component,
 * and handles higher-level animation, face morphs, and eye tracking.
 */
import React, { useEffect, useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Humanoid } from '../../characters/Humanoid'
import { CharacterRig } from '../../character/CharacterLoader'
import {
  CharacterAnimator,
  createDanceClip,
  createIdleClip,
  createJumpClip,
  createRunClip,
  createSitClip,
  createTalkClip,
  createWalkClip,
  createWaveClip,
} from '../../character/CharacterAnimator'
import { FaceMorphController } from '../../character/FaceMorphController'
import { EyeController } from '../../character/EyeController'
import { getPreset } from '../../character/CharacterPresets'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: () => void
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  actor,
  isSelected = false,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Get preset values for fallback
  const preset = getPreset(actor.name.toLowerCase())
  const skinColor = preset?.body.skinColor || '#D4A27C'
  const height = preset?.body.height || 1.0
  const build = preset?.body.build || 0.5

  // Handle rig loading from Humanoid component
  const handleLoad = useCallback((loadedRig: CharacterRig) => {
    // Cleanup previous animator if it exists
    animatorRef.current?.dispose()

    const animator = new CharacterAnimator(loadedRig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())

    animatorRef.current = animator

    // Setup face morph controller
    if (loadedRig.bodyMesh) {
      const faceMorph = new FaceMorphController(loadedRig.bodyMesh, loadedRig.morphTargetMap)
      faceMorphRef.current = faceMorph
    }

    // Setup eye controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animatorRef.current?.dispose()
    }
  }, [])

  // React to animation state changes
  useEffect(() => {
    if (animatorRef.current && actor.animation) {
      animatorRef.current.play(actor.animation as any)
    }
  }, [actor.animation])

  // React to animation speed changes
  useEffect(() => {
    if (animatorRef.current && actor.animationSpeed !== undefined) {
      animatorRef.current.setSpeed(actor.animationSpeed)
    }
  }, [actor.animationSpeed])

  // React to morph target / expression changes
  useEffect(() => {
    if (faceMorphRef.current && actor.morphTargets) {
      faceMorphRef.current.setTarget(actor.morphTargets as any)
    }
  }, [actor.morphTargets])

  // Frame update — animation, face morphs, eye blinks
  useFrame((_state, delta) => {
    // Skeletal animation
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }

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
        url={(actor as any).url}
        skinColor={skinColor}
        height={height}
        build={build}
        onLoad={handleLoad}
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

      {/* Face direction indicator (debug/editor helper) */}
      <mesh position={[0, height * 1.5, 0.4]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  )
}
