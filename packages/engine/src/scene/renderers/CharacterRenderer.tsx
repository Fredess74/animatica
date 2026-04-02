/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Creates a procedural humanoid (or loads GLB), applies animation, face morphs,
 * bone overrides, and eye tracking.
 *
 * @module @animatica/engine/scene/renderers/CharacterRenderer
 */
import React, { useEffect, useRef, useMemo, memo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createProceduralHumanoid } from '../../character/CharacterLoader'
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
import { BoneController } from '../../character/BoneController'
import { getPreset } from '../../character/CharacterPresets'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** The character actor data. */
  actor: CharacterActor
  /** Whether the character is selected in the editor. */
  isSelected?: boolean
  /** Callback for click interactions. */
  onClick?: () => void
}

/**
 * CharacterRenderer — The main renderer for character actors.
 * Manages the character rig, animations, facial expressions, and manual bone posing.
 *
 * @component
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const localGroupRef = useRef<THREE.Group>(null)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)
  const boneControllerRef = useRef<BoneController | null>(null)

  // Expose the group via the ref
  useImperativeHandle(ref, () => localGroupRef.current!)

  // Build character rig
  const rig = useMemo(() => {
    const preset = getPreset(actor.name.toLowerCase())
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  // Setup controllers
  useEffect(() => {
    if (!rig.root) return

    // 1. Animator
    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())
    animatorRef.current = animator

    // 2. Face Morph Controller
    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    faceMorphRef.current = faceMorph

    // 3. Eye Controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController

    // 4. Bone Controller (Manual posing)
    const boneController = new BoneController(rig.bones)
    boneControllerRef.current = boneController

    return () => {
      animator.dispose()
    }
  }, [rig])

  // React to animation state changes
  useEffect(() => {
    if (animatorRef.current && actor.animation) {
      animatorRef.current.play(actor.animation as any)
    }
  }, [actor.animation])

  // React to animation speed changes
  useEffect(() => {
    if (animatorRef.current && actor.animationSpeed) {
      animatorRef.current.setSpeed(actor.animationSpeed)
    }
  }, [actor.animationSpeed])

  // React to morph target / expression changes
  useEffect(() => {
    if (faceMorphRef.current && actor.morphTargets) {
      faceMorphRef.current.setTarget(actor.morphTargets as any)
    }
  }, [actor.morphTargets])

  // React to bone pose changes
  useEffect(() => {
    if (boneControllerRef.current && actor.bodyPose) {
      boneControllerRef.current.updatePose(actor.bodyPose)
    }
  }, [actor.bodyPose])

  // Frame update loop
  useFrame((_state, delta) => {
    // 1. Skeletal animation (AnimationMixer)
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }

    // 2. Bone posing overrides (Applied AFTER animation)
    if (boneControllerRef.current) {
      boneControllerRef.current.apply(delta)
    }

    // 3. Face morph blending
    if (faceMorphRef.current) {
      faceMorphRef.current.update(delta)
    }

    // 4. Eye auto-blink + look-at
    if (eyeControllerRef.current && faceMorphRef.current) {
      const headPos = localGroupRef.current
        ? new THREE.Vector3().setFromMatrixPosition(localGroupRef.current.matrixWorld)
        : undefined
      const eyeValues = eyeControllerRef.current.update(delta, headPos)
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

  // Rules of Hooks: No conditional returns before hooks.
  if (!actor.visible) return null

  return (
    <group
      ref={localGroupRef}
      name={actor.id}
      position={actor.transform.position}
      rotation={actor.transform.rotation}
      scale={actor.transform.scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {/* Character rig */}
      <primitive object={rig.root} />

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
