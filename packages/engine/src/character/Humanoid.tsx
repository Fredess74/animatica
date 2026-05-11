/**
 * Humanoid — Base component for rigged character models.
 * Loads GLB assets via useGLTF and applies skeletal posing.
 * Falls back to a procedural mesh if the model is unavailable.
 *
 * @module @animatica/engine/character
 */
import React, { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { extractRig, createProceduralHumanoid, type CharacterRig } from './CharacterLoader'
import { BoneController } from './BoneController'
import type { CharacterActor } from '../types'

export interface HumanoidProps {
  /** URL of the GLB model to load. If omitted, renders procedural fallback. */
  url?: string
  /** The character actor data for pose/transform updates. */
  actor: CharacterActor
}

/**
 * Internal base component that handles bone posing and animations
 * for a resolved CharacterRig.
 */
const HumanoidBase: React.FC<{ rig: CharacterRig; actor: CharacterActor }> = ({ rig, actor }) => {
  const boneController = useMemo(() => new BoneController(rig.bones), [rig.bones])
  const { actions } = useAnimations(rig.animations, rig.root)

  useEffect(() => {
    const idleAction = actions['idle'] || Object.values(actions)[0]
    if (idleAction) {
      idleAction.reset().fadeIn(0.5).play()
    }
    return () => {
      if (idleAction) idleAction.fadeOut(0.5)
    }
  }, [actions])

  useFrame(() => {
    if (actor.bodyPose) {
      boneController.applyPose(actor.bodyPose)
    }
  })

  return <primitive object={rig.root} />
}

/**
 * Component for loading and rendering a GLB-based humanoid.
 */
const HumanoidGLB: React.FC<{ url: string; actor: CharacterActor }> = ({ url, actor }) => {
  const gltf = useGLTF(url)
  const rig = useMemo(() => extractRig(gltf.scene, gltf.animations), [gltf])
  return <HumanoidBase rig={rig} actor={actor} />
}

/**
 * Component for rendering a procedural fallback humanoid.
 */
const HumanoidProcedural: React.FC<{ actor: CharacterActor }> = ({ actor }) => {
  const rig = useMemo(() => createProceduralHumanoid(), [])
  return <HumanoidBase rig={rig} actor={actor} />
}

/**
 * Humanoid component.
 * Dispatches to GLB or Procedural rendering based on the presence of a URL.
 */
export const Humanoid: React.FC<HumanoidProps> = ({ url, actor }) => {
  if (url) {
    return <HumanoidGLB url={url} actor={actor} />
  }
  return <HumanoidProcedural actor={actor} />
}
