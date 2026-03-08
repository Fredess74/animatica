import React, { useEffect, useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CharacterAnimator, createIdleClip, AnimState } from './CharacterAnimator'
import { CharacterRig, createProceduralHumanoid } from './CharacterLoader'
import { parseGLBResult, glbToCharacterRig } from './GLBLoader'

export interface HumanoidProps {
  /** Optional URL to a GLB model. If not provided, a procedural humanoid is used. */
  url?: string
  /** The current animation state to play. Defaults to 'idle'. */
  animation?: AnimState
  /** Speed multiplier for the animation. Defaults to 1. */
  animationSpeed?: number
  /** Skin color for the procedural fallback. */
  skinColor?: string
  /** Height factor for the procedural fallback. */
  height?: number
  /** Build/width factor for the procedural fallback. */
  build?: number
}

/**
 * Humanoid — Core component for rendering rigged humanoid characters.
 * Handles GLB loading with useGLTF and provides a procedural fallback.
 *
 * @component
 * @example
 * ```tsx
 * <Humanoid url="path/to/model.glb" animation="walk" />
 * ```
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  url,
  animation = 'idle',
  animationSpeed = 1,
  skinColor,
  height,
  build,
}) => {
  return (
    <Suspense
      fallback={
        <ProceduralHumanoid
          skinColor={skinColor}
          height={height}
          build={build}
          animation={animation}
          animationSpeed={animationSpeed}
        />
      }
    >
      {url ? (
        <GLBHumanoid url={url} animation={animation} animationSpeed={animationSpeed} />
      ) : (
        <ProceduralHumanoid
          skinColor={skinColor}
          height={height}
          build={build}
          animation={animation}
          animationSpeed={animationSpeed}
        />
      )}
    </Suspense>
  )
}

const ProceduralHumanoid: React.FC<Omit<HumanoidProps, 'url'>> = ({
  skinColor,
  height,
  build,
  animation = 'idle',
  animationSpeed = 1,
}) => {
  const rig = useMemo(
    () => createProceduralHumanoid({ skinColor, height, build }),
    [skinColor, height, build]
  )
  return <RigRenderer rig={rig} animation={animation} animationSpeed={animationSpeed} />
}

const GLBHumanoid: React.FC<{ url: string; animation: AnimState; animationSpeed: number }> = ({
  url,
  animation,
  animationSpeed,
}) => {
  const { scene, animations } = useGLTF(url)
  const rig = useMemo(() => {
    const result = parseGLBResult(scene as THREE.Group, animations)
    return glbToCharacterRig(result)
  }, [scene, animations])

  return <RigRenderer rig={rig} animation={animation} animationSpeed={animationSpeed} />
}

const RigRenderer: React.FC<{ rig: CharacterRig; animation: AnimState; animationSpeed: number }> = ({
  rig,
  animation,
  animationSpeed,
}) => {
  const animatorRef = useRef<CharacterAnimator | null>(null)

  // Initialize animator only when rig changes
  useEffect(() => {
    if (!rig.root) return
    const animator = new CharacterAnimator(rig.root)

    // Always register basic procedural clips as fallback
    animator.registerClip('idle', createIdleClip())

    // Register clips from the GLB if they match our state names
    rig.animations.forEach((clip) => {
      const name = clip.name.toLowerCase()
      if (name.includes('idle')) animator.registerClip('idle', clip)
      if (name.includes('walk')) animator.registerClip('walk', clip)
      if (name.includes('run')) animator.registerClip('run', clip)
      if (name.includes('talk')) animator.registerClip('talk', clip)
      if (name.includes('wave')) animator.registerClip('wave', clip)
      if (name.includes('dance')) animator.registerClip('dance', clip)
      if (name.includes('sit')) animator.registerClip('sit', clip)
      if (name.includes('jump')) animator.registerClip('jump', clip)
    })

    animator.play(animation)
    animator.setSpeed(animationSpeed)
    animatorRef.current = animator

    return () => animator.dispose()
  }, [rig])

  // React to animation state changes without recreating animator
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.play(animation)
    }
  }, [animation])

  // React to animation speed changes without recreating animator
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setSpeed(animationSpeed)
    }
  }, [animationSpeed])

  useFrame((_, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }
  })

  return <primitive object={rig.root} />
}
