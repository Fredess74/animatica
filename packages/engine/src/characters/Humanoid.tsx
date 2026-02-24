import React, { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { AnimationState, MorphTargets, BodyPose } from '../types'

interface HumanoidProps {
  /** URL of the ReadyPlayerMe GLB model. */
  url: string
  /** Current animation state to play. */
  animation?: AnimationState
  /** Speed multiplier for the animation. */
  animationSpeed?: number
  /** Facial expression morph targets (reserved for Task 13). */
  morphTargets?: MorphTargets
  /** Custom body pose overrides (reserved for Task 12). */
  bodyPose?: BodyPose
}

/**
 * Humanoid component that loads a ReadyPlayerMe GLB model and handles animations.
 * Provides graceful fallbacks for loading and error states.
 *
 * @component
 * @example
 * ```tsx
 * <Humanoid url="https://models.readyplayer.me/user.glb" animation="idle" />
 * ```
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  url,
  animation = 'idle',
  animationSpeed = 1,
  // morphTargets,
  // bodyPose,
}) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GltfModel
        url={url}
        animation={animation}
        animationSpeed={animationSpeed}
      />
    </Suspense>
  )
}

/**
 * Internal component that handles GLTF loading and animation logic.
 * Suspends while loading.
 */
const GltfModel: React.FC<HumanoidProps> = ({
  url,
  animation = 'idle',
  animationSpeed = 1,
}) => {
  // Guard useGLTF with a try-catch-like behavior is hard because it suspends.
  // We rely on ErrorBoundary at a higher level (SceneManager/SceneObject).
  const { scene, animations } = useGLTF(url)

  if (!scene) return <ErrorFallback />

  const group = useRef<THREE.Group>(null)
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    // Try to find the requested animation, or fall back to 'idle', or the first available
    const targetName = names.find(n => n.toLowerCase().includes(animation.toLowerCase()))
      || names.find(n => n.toLowerCase().includes('idle'))
      || names[0]

    if (targetName && actions[targetName]) {
      const action = actions[targetName]!
      action.reset().fadeIn(0.5).play()
      action.setEffectiveTimeScale(animationSpeed)

      return () => {
        action.fadeOut(0.5)
      }
    }
  }, [animation, actions, names, animationSpeed])

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

/**
 * Renders during GLTF loading.
 */
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[0.5, 1.8, 0.5]} />
    <meshStandardMaterial color="#22C55E" wireframe />
  </mesh>
)

/**
 * Renders if the GLTF fails to load.
 */
const ErrorFallback = () => (
  <mesh>
    <capsuleGeometry args={[0.5, 1.8, 4, 8]} />
    <meshStandardMaterial color="#EF4444" />
  </mesh>
)

// Preload the model if needed
// useGLTF.preload(url)
