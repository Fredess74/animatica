import React, { useEffect, useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CharacterActor } from '../types'
import { createProceduralHumanoid, CharacterRig } from './CharacterLoader'
import { parseGLBResult, glbToCharacterRig } from './GLBLoader'
import { CharacterAnimator, createIdleClip, createWalkClip } from './CharacterAnimator'
import { FaceMorphController } from './FaceMorphController'
import { EyeController } from './EyeController'
import { getPreset } from './CharacterPresets'

interface HumanoidProps {
  actor: CharacterActor
}

/**
 * HumanoidInner — Handles the actual rendering and animation logic
 * once the rig is determined (either GLB or Procedural).
 */
const HumanoidInner: React.FC<{ actor: CharacterActor; rig: CharacterRig }> = ({ actor, rig }) => {
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const faceMorphRef = useRef<FaceMorphController | null>(null)
  const eyeControllerRef = useRef<EyeController | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Setup animator and controllers
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())

    // Add animations from GLB if present
    rig.animations.forEach(clip => {
        // Map common names to our AnimState if possible
        if (clip.name.toLowerCase().includes('idle')) animator.registerClip('idle', clip)
        if (clip.name.toLowerCase().includes('walk')) animator.registerClip('walk', clip)
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
      faceMorphRef.current.setTarget(actor.morphTargets as any)
    }
  }, [actor.morphTargets])

  // Frame update loop
  useFrame((_state, delta) => {
    if (animatorRef.current) animatorRef.current.update(delta)
    if (faceMorphRef.current) faceMorphRef.current.update(delta)

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
    </group>
  )
}

/**
 * GLBHumanoid — Loads model from URL and renders HumanoidInner
 */
const GLBHumanoid: React.FC<{ actor: CharacterActor; url: string }> = ({ actor, url }) => {
  const { scene, animations } = useGLTF(url)

  const rig = useMemo(() => {
    const result = parseGLBResult(scene as THREE.Group, animations)
    return glbToCharacterRig(result)
  }, [scene, animations])

  return <HumanoidInner actor={actor} rig={rig} />
}

/**
 * ProceduralHumanoid — Renders fallback procedural humanoid
 */
const ProceduralHumanoid: React.FC<{ actor: CharacterActor }> = ({ actor }) => {
  const rig = useMemo(() => {
    const preset = getPreset(actor.name.toLowerCase())
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  return <HumanoidInner actor={actor} rig={rig} />
}

/**
 * Humanoid — R3F component for loading and rendering characters.
 * Handles GLB loading with procedural fallback.
 */
export const Humanoid: React.FC<HumanoidProps> = ({ actor }) => {
  if (actor.modelUrl) {
    return (
      <Suspense fallback={<ProceduralHumanoid actor={actor} />}>
        <GLBHumanoid actor={actor} url={actor.modelUrl} />
      </Suspense>
    )
  }

  return <ProceduralHumanoid actor={actor} />
}
