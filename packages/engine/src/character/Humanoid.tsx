/**
 * Humanoid — Base component for rendering rigged characters.
 * Handles GLB loading via Ready Player Me / Mixamo and procedural fallbacks.
 *
 * @module @animatica/engine/character
 */
import React, { Suspense, useMemo, useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { extractRig, createProceduralHumanoid } from './CharacterLoader'
import { CharacterAnimator, createIdleClip, AnimState } from './CharacterAnimator'

export interface HumanoidProps {
    /** URL to the .glb model. If missing, renders procedural fallback. */
    url?: string
    /** Current animation state to play. Defaults to 'idle'. */
    animation?: AnimState
    /** Custom skin color (for procedural fallback). */
    skinColor?: string
    /** Height multiplier (for procedural fallback). */
    height?: number
    /** Build/width multiplier (for procedural fallback). */
    build?: number
}

/**
 * Humanoid component — The foundational character rendering piece.
 * Attempts to load an external GLB, falling back to procedural humanoid on failure or if no URL provided.
 *
 * @component
 */
export const Humanoid: React.FC<HumanoidProps> = ({
    url,
    animation = 'idle',
    skinColor = '#D4A27C',
    height = 1.0,
    build = 0.5,
}) => {
    return (
        <Suspense fallback={<ProceduralHumanoid skinColor={skinColor} height={height} build={build} />}>
            {url ? (
                <GLBHumanoid url={url} animation={animation} />
            ) : (
                <ProceduralHumanoid skinColor={skinColor} height={height} build={build} animation={animation} />
            )}
        </Suspense>
    )
}

/**
 * Humanoid rendered from an external GLB file.
 */
const GLBHumanoid: React.FC<{ url: string; animation: AnimState }> = ({ url, animation }) => {
    // Attempt to load GLTF
    const gltf = useGLTF(url)

    // Extract rig data from scene
    const rig = useMemo(() => {
        if (!gltf) return null
        return extractRig(gltf.scene, gltf.animations)
    }, [gltf])

    const animatorRef = useRef<CharacterAnimator | null>(null)

    useEffect(() => {
        if (!rig || !rig.root) return

        const animator = new CharacterAnimator(rig.root)

        // Register clips from GLB
        if (rig.animations && rig.animations.length > 0) {
            rig.animations.forEach(clip => {
                animator.registerClip(clip.name as AnimState, clip)
            })
        }

        // Always ensure we have a fallback idle
        animator.registerClip('idle', createIdleClip())

        animator.play(animation)
        animatorRef.current = animator

        return () => {
            animator.dispose()
        }
    }, [rig, animation])

    if (!rig) return null

    return <primitive object={rig.root} />
}

/**
 * Humanoid rendered using procedural geometry fallbacks.
 * Used as a loading state or when no external asset is available.
 */
const ProceduralHumanoid: React.FC<{
    skinColor?: string;
    height?: number;
    build?: number;
    animation?: AnimState
}> = ({
    skinColor,
    height,
    build,
    animation = 'idle',
}) => {
    const rig = useMemo(() => createProceduralHumanoid({ skinColor, height, build }), [skinColor, height, build])
    const animatorRef = useRef<CharacterAnimator | null>(null)

    useEffect(() => {
        const animator = new CharacterAnimator(rig.root)
        animator.registerClip('idle', createIdleClip())
        animator.play(animation)
        animatorRef.current = animator

        return () => {
            animator.dispose()
        }
    }, [rig, animation])

    return <primitive object={rig.root} />
}
