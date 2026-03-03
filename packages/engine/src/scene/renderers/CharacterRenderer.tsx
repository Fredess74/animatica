/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Creates a procedural humanoid (or loads GLB) via Humanoid component,
 * and applies animation, face morphs, and eye tracking.
 */
import React, { useEffect, useRef, useMemo, useCallback, memo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Humanoid } from '../../character/Humanoid'
import { CharacterAnimator, createIdleClip, createWalkClip } from '../../character/CharacterAnimator'
import { FaceMorphController } from '../../character/FaceMorphController'
import { EyeController } from '../../character/EyeController'
import { getPreset } from '../../character/CharacterPresets'
import type { CharacterActor } from '../../types'
import type { CharacterRig } from '../../character/CharacterLoader'

interface CharacterRendererProps {
  /** The character actor data containing transform, visibility, and properties. */
  actor: CharacterActor
  /** Whether the character is currently selected in the editor. */
  isSelected?: boolean
  /** Callback for when the character is clicked. */
  onClick?: () => void
}

/**
 * Renders a character actor using the Humanoid component for the rig.
 * Manages character-specific systems like animation and facial expressions.
 *
 * @component
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Stable references to state for use in callbacks without triggering re-runs
  const stateRef = useRef({
    animation: actor.animation,
    animationSpeed: actor.animationSpeed,
    morphTargets: actor.morphTargets,
  })

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = {
      animation: actor.animation,
      animationSpeed: actor.animationSpeed,
      morphTargets: actor.morphTargets,
    }
  }, [actor.animation, actor.animationSpeed, actor.morphTargets])

  // Expose the internal group ref to the parent
  useImperativeHandle(ref, () => groupRef.current!)

  const { transform, visible, animation, animationSpeed, morphTargets, name } = actor

  // Determine procedural parameters from preset if available
  const presetParams = useMemo(() => {
    const preset = getPreset(name.toLowerCase()) || getPreset('default-human')
    return {
      skinColor: preset?.body.skinColor || '#D4A27C',
      height: preset?.body.height || 1.0,
      build: preset?.body.build || 0.5,
    }
  }, [name])

  // Handle rig loading from Humanoid component
  const handleRigLoaded = useCallback((rig: CharacterRig) => {
    if (!rig.root) return

    // Clean up old controllers before re-initializing
    animatorRef.current?.dispose()

    // Setup animator
    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())

    // Use the latest values from stateRef to initialize
    const { animation: currentAnim, animationSpeed: currentSpeed, morphTargets: currentMorphs } = stateRef.current

    animator.play((currentAnim as any) || 'idle')
    animator.setSpeed(currentSpeed || 1.0)
    animatorRef.current = animator

    // Setup face morph controller
    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    if (currentMorphs) {
      faceMorph.setTarget(currentMorphs as any)
    }
    faceMorphRef.current = faceMorph

    // Setup eye controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController
  }, []) // Empty dependency array makes this callback stable

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animatorRef.current?.dispose()
      animatorRef.current = null
      faceMorphRef.current = null
      eyeControllerRef.current = null
    }
  }, [])

  // React to animation changes
  useEffect(() => {
    if (animatorRef.current && animation) {
      animatorRef.current.play(animation as any)
    }
  }, [animation])

  // React to animation speed changes
  useEffect(() => {
    if (animatorRef.current && animationSpeed !== undefined) {
      animatorRef.current.setSpeed(animationSpeed)
    }
  }, [animationSpeed])

  // React to morph target / expression changes
  useEffect(() => {
    if (faceMorphRef.current && morphTargets) {
      faceMorphRef.current.setTarget(morphTargets as any)
    }
  }, [morphTargets])

  // Frame update loop
  useFrame((_state, delta) => {
    if (!visible) return

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
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

  if (!visible) return null

  return (
    <group
      ref={groupRef}
      name={actor.id}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <Humanoid
        onRigLoaded={handleRigLoaded}
        skinColor={presetParams.skinColor}
        height={presetParams.height}
        build={presetParams.build}
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
