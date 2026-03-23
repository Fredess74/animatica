/**
 * Humanoid — Base component for humanoid characters.
 * Loads GLB models or falls back to a procedural mesh.
 */
import React, { Suspense, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createProceduralHumanoid, extractRig, CharacterRig } from './CharacterLoader'
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
  AnimState
} from './CharacterAnimator'

export interface HumanoidProps {
  /** URL to the GLB model (ReadyPlayerMe or compatible) */
  url?: string
  /** Current animation state */
  animation?: AnimState
  /** Animation speed multiplier */
  animationSpeed?: number
  /** Position in 3D space */
  position?: [number, number, number]
  /** Rotation in Euler angles (radians) */
  rotation?: [number, number, number]
  /** Scale factor */
  scale?: [number, number, number]
  /** Callback when the rig is loaded and ready */
  onRigReady?: (rig: CharacterRig) => void
}

/**
 * Internal component to handle GLB loading within Suspense
 */
const GLBModel: React.FC<{ url: string; onRigReady: (rig: CharacterRig) => void }> = ({ url, onRigReady }) => {
  const { scene, animations } = useGLTF(url)

  const rig = useMemo(() => {
    return extractRig(scene as THREE.Group, animations)
  }, [scene, animations])

  useEffect(() => {
    onRigReady(rig)
  }, [rig, onRigReady])

  return <primitive object={rig.root} />
}

/**
 * Humanoid component renders a character using either a GLB model or a procedural fallback.
 * It manages animations and provides a reference to the underlying THREE.Group.
 */
export const Humanoid = forwardRef<THREE.Group, HumanoidProps>(({
  url,
  animation = 'idle',
  animationSpeed = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onRigReady
}, ref) => {
  const groupRef = useRef<THREE.Group>(null!)
  const animatorRef = useRef<CharacterAnimator | null>(null)
  const [rig, setRig] = useState<CharacterRig | null>(null)

  useImperativeHandle(ref, () => groupRef.current)

  // Fallback rig (procedural) using Brand Green (#16A34A) from DESIGN_TOKENS.md
  const fallbackRig = useMemo(() => {
    return createProceduralHumanoid({ skinColor: '#16A34A' })
  }, [])

  const currentRig = rig || fallbackRig

  // Notify parent when rig changes
  useEffect(() => {
    if (onRigReady) {
      onRigReady(currentRig)
    }
  }, [currentRig, onRigReady])

  // Setup/Update Animator
  useEffect(() => {
    if (!currentRig.root) return

    const animator = new CharacterAnimator(currentRig.root)

    // Register standard procedural animations
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())

    // Play initial animation
    animator.play(animation)
    animator.setSpeed(animationSpeed)
    animatorRef.current = animator

    return () => {
      animator.dispose()
    }
  }, [currentRig])

  // React to animation property changes
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.play(animation)
    }
  }, [animation])

  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setSpeed(animationSpeed)
    }
  }, [animationSpeed])

  // Animation loop
  useFrame((_state, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {url ? (
        <Suspense fallback={<primitive object={fallbackRig.root} />}>
          <GLBModel url={url} onRigReady={setRig} />
        </Suspense>
      ) : (
        <primitive object={fallbackRig.root} />
      )}
    </group>
  )
})

Humanoid.displayName = 'Humanoid'
