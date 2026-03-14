/**
 * Humanoid — R3F component for loading and animating a GLB-based character.
 * Primarily designed for ReadyPlayerMe models, but supports any humanoid rig.
 *
 * @module @animatica/engine/character/Humanoid
 */
import React, { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { parseGLBResult, glbToCharacterRig } from './GLBLoader'
import { CharacterAnimator, createIdleClip, createWalkClip } from './CharacterAnimator'
import { FaceMorphController } from './FaceMorphController'
import { EyeController } from './EyeController'
import type { CharacterActor } from '../types'

interface HumanoidProps {
  /** The character actor data */
  actor: CharacterActor
  /** Ref to the root group (for positioning/selection) */
  groupRef?: React.RefObject<THREE.Group | null>
}

/**
 * Humanoid component - loads GLB and applies animations/morphs.
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  actor,
  groupRef,
}) => {
  const { modelUrl } = actor

  // Load GLTF. If modelUrl is missing, this component shouldn't be rendered
  // by CharacterRenderer, but we handle it just in case.
  const { scene, animations } = useGLTF(modelUrl || '')

  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Extract rig from loaded GLB
  const rig = useMemo(() => {
    const result = parseGLBResult(scene as THREE.Group, animations)
    return glbToCharacterRig(result)
  }, [scene, animations])

  // Setup controllers
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)

    // Register standard clips
    // In a real scenario, we might want to load external clips too
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())

    // Also register any clips found in the GLB
    rig.animations.forEach((clip) => {
        animator.registerClip(clip.name as any, clip)
    })

    animator.play(actor.animation || 'idle')
    animatorRef.current = animator

    // Setup face morph controller
    if (rig.bodyMesh) {
        const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
        faceMorphRef.current = faceMorph
    }

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

  // React to morph target / expression changes
  useEffect(() => {
    if (faceMorphRef.current && actor.morphTargets) {
      faceMorphRef.current.setTarget(actor.morphTargets as any)
    }
  }, [actor.morphTargets])

  // Frame update
  useFrame((_state, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }

    if (faceMorphRef.current) {
      faceMorphRef.current.update(delta)
    }

    if (eyeControllerRef.current && faceMorphRef.current) {
      const headPos = groupRef?.current
        ? new THREE.Vector3().setFromMatrixPosition(groupRef.current.matrixWorld)
        : undefined
      const eyeValues = eyeControllerRef.current.update(delta, headPos)
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

  return <primitive object={rig.root} />
}

// Pre-load the model if URL is provided
// This is a common pattern with useGLTF to avoid waterfalls
export function preloadHumanoid(url: string) {
    useGLTF.preload(url)
}
