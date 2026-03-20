import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createProceduralHumanoid, extractRig } from './CharacterLoader'
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
} from './CharacterAnimator'
import { FaceMorphController } from './FaceMorphController'
import { EyeController } from './EyeController'
import type { AnimationState, MorphTargets } from '../types'

export interface HumanoidProps {
  /** Optional URL for a GLB model. If not provided, a procedural humanoid is used. */
  url?: string
  /** Skin color for procedural humanoid (fallback). */
  skinColor?: string
  /** Height for procedural humanoid (fallback). */
  height?: number
  /** Build (width) for procedural humanoid (fallback). */
  build?: number
  /** Current animation state to play. */
  animation?: AnimationState
  /** Playback speed for the animation. */
  animationSpeed?: number
  /** Morph target values for facial expressions. */
  morphTargets?: MorphTargets
}

/**
 * HumanoidInner — Separate component to safely use useGLTF only when a URL is provided.
 */
const HumanoidModel = ({ url, rigProps }: { url?: string, rigProps: any }) => {
  // Only call useGLTF if url is truthy to avoid unnecessary network requests
  const gltf = useGLTF(url || '') as any
  const { scene: gltfScene, animations: gltfAnims } = gltf || { scene: null, animations: [] }

  const rig = useMemo(() => {
    if (gltfScene) {
      return extractRig(gltfScene, gltfAnims)
    }
    return createProceduralHumanoid(rigProps)
  }, [gltfScene, gltfAnims, rigProps])

  return rig
}

// Pre-allocate vector to avoid GC pressure in useFrame
const _tempVec = new THREE.Vector3()

/**
 * Humanoid — Base component for rendering a humanoid character.
 * Loads a GLB model from a URL or generates a procedural rig.
 * Manages skeletal animation, face morphs, and auto-blinking.
 */
export const Humanoid = React.memo(forwardRef<THREE.Group, HumanoidProps>(({
  url,
  skinColor = '#D4A27C',
  height = 1.0,
  build = 0.5,
  animation = 'idle',
  animationSpeed = 1.0,
  morphTargets,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)

  // Exposed for parent access (like Selection indicators)
  useImperativeHandle(ref, () => groupRef.current!)

  // Rig properties for procedural fallback
  const rigProps = useMemo(() => ({ skinColor, height, build }), [skinColor, height, build])

  // We need the rig data but useGLTF is a hook.
  // To avoid calling useGLTF conditionally, we always use the hook but handle the empty URL
  // or we could use a different approach. Drei's useGLTF actually supports null/undefined in newer versions.
  // However, to be safe and avoid the 404 issue reported in review:
  const gltf = useGLTF(url || '') as any
  const gltfScene = url ? gltf?.scene : null
  const gltfAnims = url ? gltf?.animations : []

  const rig = useMemo(() => {
    if (gltfScene) {
      return extractRig(gltfScene, gltfAnims)
    }
    return createProceduralHumanoid(rigProps)
  }, [gltfScene, gltfAnims, rigProps])

  // Setup animator and controllers
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)

    // Register standard clips
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())

    // Register clips from GLB if any
    if (rig.animations) {
      rig.animations.forEach(clip => {
        const stateName = clip.name.toLowerCase() as any
        animator.registerClip(stateName, clip)
      })
    }

    animator.play(animation)
    animator.setSpeed(animationSpeed)
    animatorRef.current = animator

    // Setup face morph controller
    const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap)
    faceMorphRef.current = faceMorph

    // Setup eye controller
    const eyeController = new EyeController()
    eyeControllerRef.current = eyeController

    return () => {
      animator.dispose()
    }
  }, [rig])

  // React to animation state changes
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.play(animation)
    }
  }, [animation])

  // React to animation speed changes
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setSpeed(animationSpeed)
    }
  }, [animationSpeed])

  // React to morph target changes
  useEffect(() => {
    if (faceMorphRef.current && morphTargets) {
      faceMorphRef.current.setTarget(morphTargets as any)
    }
  }, [morphTargets])

  // Frame update loop
  useFrame((_state, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }

    if (faceMorphRef.current) {
      faceMorphRef.current.update(delta)
    }

    if (eyeControllerRef.current && faceMorphRef.current && groupRef.current) {
      // Use pre-allocated vector
      _tempVec.setFromMatrixPosition(groupRef.current.matrixWorld)
      const eyeValues = eyeControllerRef.current.update(delta, _tempVec)
      faceMorphRef.current.setImmediate(eyeValues)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={rig.root} />
    </group>
  )
}))

Humanoid.displayName = 'Humanoid'
