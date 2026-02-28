/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Creates a procedural humanoid (or loads GLB), applies animation, face morphs, and eye tracking.
 */
import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createProceduralHumanoid } from '../../character/CharacterLoader'
import { CharacterAnimator, createIdleClip, createWalkClip } from '../../character/CharacterAnimator'
import { FaceMorphController } from '../../character/FaceMorphController'
import { BoneController } from '../../character/BoneController'
import { EyeController } from '../../character/EyeController'
import { getPreset } from '../../character/CharacterPresets'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: () => void
}

export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
  actor,
  isSelected = false,
  onClick,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)

  // Forward the group ref to parent
  useImperativeHandle(ref, () => groupRef.current!)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const boneControllerRef = useRef<BoneController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Build character rig
  const rig = useMemo(() => {
    const preset = getPreset(actor.name.toLowerCase())
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  // Setup animator
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.play(actor.animation || 'idle')
    animatorRef.current = animator

    // Setup face morph controller
    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    faceMorphRef.current = faceMorph

    // Setup bone controller
    const boneController = new BoneController(rig.bones)
    if (actor.bodyPose) {
      boneController.setImmediate(actor.bodyPose)
    }
    boneControllerRef.current = boneController

    // Setup eye controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController

    return () => {
      animator.dispose()
    }
  }, [rig, actor.animation])

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

  // React to morph target / expression changes from CharacterPanel
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

    // Custom body pose
    if (boneControllerRef.current && actor.bodyPose) {
      boneControllerRef.current.update(actor.bodyPose, delta)
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
      visible={actor.visible}
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
