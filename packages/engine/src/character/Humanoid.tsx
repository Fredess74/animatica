import React, { useEffect, useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createProceduralHumanoid } from './CharacterLoader'
import {
  CharacterAnimator,
  createIdleClip,
  createWalkClip,
  createRunClip,
  createTalkClip,
  createWaveClip,
  createDanceClip,
  createSitClip,
  createJumpClip,
} from './CharacterAnimator'
import { FaceMorphController } from './FaceMorphController'
import { EyeController } from './EyeController'
import { BoneController } from './BoneController'
import { getPreset } from './CharacterPresets'
import type { CharacterActor } from '../types'

interface HumanoidProps {
  /** Character actor data from store */
  actor: CharacterActor
  /** Whether the character is currently selected in the editor */
  isSelected?: boolean
}

/**
 * Humanoid — The core character component.
 * Manages 3D rig loading (procedural or GLB), skeletal animation,
 * bone posing, facial morphs, and eye tracking.
 *
 * @component
 */
export const Humanoid: React.FC<HumanoidProps> = memo(({
  actor,
  isSelected = false,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const boneControllerRef = useRef<BoneController | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // 1. Build character rig based on actor name (preset lookup)
  const rig = useMemo(() => {
    const preset = getPreset(actor.name.toLowerCase()) || getPreset('default-human')
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    // Note: GLB loading logic can be added here later using useGLTF
    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  // 2. Initialize Controllers
  useEffect(() => {
    if (!rig.root) return

    // Animator
    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())
    // Initial animation state will be handled by the useEffect watcher
    animatorRef.current = animator

    // Bone Controller
    const boneController = new BoneController(rig.bones)
    boneControllerRef.current = boneController

    // Face Morph Controller
    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    faceMorphRef.current = faceMorph

    // Eye Controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController

    return () => {
      animator.dispose()
    }
  }, [rig])

  // 3. React to Actor Property Changes
  useEffect(() => {
    if (animatorRef.current && actor.animation) {
      animatorRef.current.play(actor.animation)
    }
  }, [actor.animation])

  useEffect(() => {
    if (animatorRef.current && actor.animationSpeed !== undefined) {
      animatorRef.current.setSpeed(actor.animationSpeed)
    }
  }, [actor.animationSpeed])

  useEffect(() => {
    if (boneControllerRef.current && actor.bodyPose) {
      boneControllerRef.current.setPose(actor.bodyPose)
    }
  }, [actor.bodyPose])

  useEffect(() => {
    if (faceMorphRef.current && actor.morphTargets) {
      faceMorphRef.current.setTarget(actor.morphTargets)
    }
  }, [actor.morphTargets])

  // 4. Animation Loop
  useFrame((_state, delta) => {
    if (!actor.visible) return

    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }

    if (faceMorphRef.current) {
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

  return (
    <group ref={groupRef}>
      <primitive object={rig.root} />

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#22C55E" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
})

Humanoid.displayName = 'Humanoid'
