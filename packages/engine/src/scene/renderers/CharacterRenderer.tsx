/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Creates a procedural humanoid (or loads GLB), applies animation, face morphs, and manual bone posing.
 */
import { useEffect, useRef, useMemo, memo, forwardRef, useImperativeHandle } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import {
  createProceduralHumanoid,
  CharacterAnimator,
  createDanceClip,
  createIdleClip,
  createJumpClip,
  createRunClip,
  createSitClip,
  createTalkClip,
  createWalkClip,
  createWaveClip,
  FaceMorphController,
  EyeController,
  getPreset,
  BoneController,
} from '../../character'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

/**
 * Renders a humanoid character.
 * Supports procedural generation, skeletal animation, facial morphs, and manual bone overrides.
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
  const boneControllerRef = useRef<BoneController | null>(null)

  // Expose the group ref to parent components
  useImperativeHandle(ref, () => groupRef.current!)

  // Build character rig
  const rig = useMemo(() => {
    // Preset lookup (fallback to name if ID not found)
    const preset = getPreset(actor.name.toLowerCase()) || getPreset('default-human')
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  // Setup controllers on mount or rig change
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
    animator.play(actor.animation || 'idle')
    animatorRef.current = animator

    // 2. Face Morph Controller
    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    faceMorphRef.current = faceMorph

    // 3. Eye Controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController

    // 4. Bone Controller (Manual Pose Overrides)
    const boneController = new BoneController(rig.bones)
    boneController.updatePose(actor.bodyPose)
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
    if (animatorRef.current && actor.animationSpeed !== undefined) {
      animatorRef.current.setSpeed(actor.animationSpeed)
    }
  }, [actor.animationSpeed])

  // React to morph target / expression changes
  useEffect(() => {
    if (faceMorphRef.current && actor.morphTargets) {
      faceMorphRef.current.setTarget(actor.morphTargets)
    }
  }, [actor.morphTargets])

  // React to manual bone pose changes
  useEffect(() => {
    if (boneControllerRef.current && actor.bodyPose) {
      boneControllerRef.current.updatePose(actor.bodyPose)
    }
  }, [actor.bodyPose])

  // Frame update loop
  useFrame((_state, delta) => {
    // 1. Skip expensive updates if hidden
    if (!actor.visible) return

    // 2. Skeletal animation
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }

    // 3. Manual bone overrides (applies on top of animation)
    if (boneControllerRef.current) {
      boneControllerRef.current.update(delta)
    }

    // 4. Face morph blending
    if (faceMorphRef.current) {
      faceMorphRef.current.update(delta)
    }

    // 5. Eye auto-blink + look-at
    if (eyeControllerRef.current && faceMorphRef.current) {
      const headPos = groupRef.current
        ? new THREE.Vector3().setFromMatrixPosition(groupRef.current.matrixWorld)
        : undefined
      const eyeValues = eyeControllerRef.current.update(delta, headPos)
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

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
        onClick?.(e)
      }}
    >
      {/* Character rig root */}
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
