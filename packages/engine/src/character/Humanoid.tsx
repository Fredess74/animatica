import React, { useMemo, useEffect, useRef, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { extractRig, createProceduralHumanoid } from './CharacterLoader'
import {
  CharacterAnimator,
  createIdleClip,
  createWalkClip,
  createRunClip,
  createTalkClip,
  createWaveClip,
  createDanceClip,
  createSitClip,
  createJumpClip
} from './CharacterAnimator'
import { FaceMorphController } from './FaceMorphController'
import { EyeController } from './EyeController'
import { getPreset } from './CharacterPresets'
import type { CharacterActor } from '../types'

interface HumanoidProps {
  /** The character actor data. */
  actor: CharacterActor
}

/**
 * Custom hook to manage character controllers (animation, face morphs, eyes).
 */
function useHumanoidControllers(rig: any, actor: CharacterActor, animations: THREE.AnimationClip[] = []) {
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Setup animator and sub-controllers
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)
    // Register standard procedural clips
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())

    // Also register any animations embedded in the GLB
    animations.forEach(clip => {
      animator.registerClip(clip.name as any, clip)
    })

    animator.play(actor.animation || 'idle')
    animatorRef.current = animator

    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    faceMorphRef.current = faceMorph

    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController

    return () => animator.dispose()
  }, [rig, animations])

  // React to state changes
  useEffect(() => {
    animatorRef.current?.play(actor.animation as any)
  }, [actor.animation])

  useEffect(() => {
    if (actor.animationSpeed !== undefined) {
      animatorRef.current?.setSpeed(actor.animationSpeed)
    }
  }, [actor.animationSpeed])

  useEffect(() => {
    faceMorphRef.current?.setTarget(actor.morphTargets as any)
  }, [actor.morphTargets])

  // Frame loop
  useFrame((_, delta) => {
    animatorRef.current?.update(delta)
    faceMorphRef.current?.update(delta)

    if (eyeControllerRef.current && faceMorphRef.current) {
      const eyeValues = eyeControllerRef.current.update(delta)
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })
}

/**
 * Internal component to handle GLB loading and animation setup.
 * Separated to allow Suspense wrapping for the GLB fetch.
 */
const GLBHumanoid: React.FC<HumanoidProps> = ({ actor }) => {
  const { scene, animations } = useGLTF(actor.modelUrl!)
  const rig = useMemo(() => extractRig(scene as THREE.Group, animations), [scene, animations])

  useHumanoidControllers(rig, actor, animations)

  return <primitive object={rig.root} />
}

/**
 * Internal component for procedural humanoid fallback.
 * Used when no modelUrl is provided or as a Suspense fallback.
 */
const ProceduralHumanoid: React.FC<HumanoidProps> = ({ actor }) => {
  const rig = useMemo(() => {
    const preset = getPreset(actor.name.toLowerCase())
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  useHumanoidControllers(rig, actor)

  return <primitive object={rig.root} />
}

/**
 * Humanoid — Core character component.
 * Loads an external GLB model if modelUrl is provided, otherwise renders a procedural rig.
 */
export const Humanoid: React.FC<HumanoidProps> = ({ actor }) => {
  if (actor.modelUrl) {
    return (
      <Suspense fallback={<ProceduralHumanoid actor={actor} />}>
        <GLBHumanoid actor={actor} />
      </Suspense>
    )
  }

  return <ProceduralHumanoid actor={actor} />
}
