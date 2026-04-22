import React, { useMemo, useEffect, useRef, Suspense } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { extractRig, createProceduralHumanoid, type CharacterRig } from './CharacterLoader'
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
} from './CharacterAnimator'

interface HumanoidProps {
  /** URL to the GLB/GLTF model. If missing, renders procedural fallback. */
  url?: string
  /** Current animation state to play. */
  animation?: string
  /** Playback speed multiplier. */
  animationSpeed?: number
  /** Body height (0.5 - 1.5). */
  height?: number
  /** Body build (0 - 1). */
  build?: number
  /** Skin color hex. */
  skinColor?: string
  /** Callback fired when the rig is loaded and initialized. */
  onLoad?: (rig: CharacterRig) => void
}

/**
 * Internal component that handles GLTF loading.
 * Wrapped in Suspense by the main Humanoid component.
 */
const GLBModel: React.FC<{
  url: string
  animation: string
  animationSpeed: number
  onLoad?: (rig: CharacterRig) => void
}> = ({ url, animation, animationSpeed, onLoad }) => {
  const { scene, animations } = useGLTF(url)
  const animatorRef = useRef<CharacterAnimator | null>(null)

  const rig = useMemo(() => {
    const extracted = extractRig(scene as any, animations)
    return extracted
  }, [scene, animations])

  // Initialize animator once
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())

    animations.forEach((clip) => {
      animator.registerClip(clip.name as any, clip)
    })

    animatorRef.current = animator
    onLoad?.(rig)

    return () => {
      animator.dispose()
      animatorRef.current = null
    }
  }, [rig, animations, onLoad])

  // Update animation state without recreating animator
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.play(animation as any)
    }
  }, [animation])

  // Update animation speed
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setSpeed(animationSpeed)
    }
  }, [animationSpeed])

  useFrame((_, delta) => {
    animatorRef.current?.update(delta)
  })

  return <primitive object={rig.root} />
}

/**
 * Procedural fallback component.
 */
const ProceduralModel: React.FC<{
  animation: string
  animationSpeed: number
  height?: number
  build?: number
  skinColor?: string
  onLoad?: (rig: CharacterRig) => void
}> = ({ animation, animationSpeed, height, build, skinColor, onLoad }) => {
  const animatorRef = useRef<CharacterAnimator | null>(null)

  const rig = useMemo(() => {
    return createProceduralHumanoid({ height, build, skinColor })
  }, [height, build, skinColor])

  // Initialize animator once
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())
    animator.registerClip('run', createRunClip())
    animator.registerClip('talk', createTalkClip())
    animator.registerClip('wave', createWaveClip())
    animator.registerClip('dance', createDanceClip())
    animator.registerClip('sit', createSitClip())
    animator.registerClip('jump', createJumpClip())

    animatorRef.current = animator
    onLoad?.(rig)

    return () => {
      animator.dispose()
      animatorRef.current = null
    }
  }, [rig, onLoad])

  // Update animation state
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.play(animation as any)
    }
  }, [animation])

  // Update animation speed
  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setSpeed(animationSpeed)
    }
  }, [animationSpeed])

  useFrame((_, delta) => {
    animatorRef.current?.update(delta)
  })

  return <primitive object={rig.root} />
}

/**
 * Humanoid — Renders a rigged character from a GLB URL or a procedural fallback.
 * Handles animation playback and loading states.
 *
 * @component
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  url,
  animation = 'idle',
  animationSpeed = 1,
  height,
  build,
  skinColor,
  onLoad,
}) => {
  if (!url) {
    return (
      <ProceduralModel
        animation={animation}
        animationSpeed={animationSpeed}
        height={height}
        build={build}
        skinColor={skinColor}
        onLoad={onLoad}
      />
    )
  }

  return (
    <Suspense
      fallback={
        <Html center>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-green-500 font-mono text-sm">LOADING MODEL...</span>
          </div>
        </Html>
      }
    >
      <GLBModel
        url={url}
        animation={animation}
        animationSpeed={animationSpeed}
        onLoad={onLoad}
      />
    </Suspense>
  )
}
