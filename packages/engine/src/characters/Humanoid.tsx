import React, { Suspense, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { createProceduralHumanoid, extractRig, CharacterRig } from '../character/CharacterLoader'

interface HumanoidProps {
  /** Optional URL to a GLB model (e.g. ReadyPlayerMe) */
  url?: string
  /** Fallback properties if no GLB is loaded */
  height?: number
  build?: number
  skinColor?: string
  /** Callback when the rig is loaded/changed */
  onLoad?: (rig: CharacterRig) => void
}

/**
 * Humanoid — Core component for character rendering.
 * Loads a GLB model with automatic bone mapping, or generates a procedural humanoid as fallback.
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  url,
  height = 1.0,
  build = 0.5,
  skinColor = '#D4A27C',
  onLoad,
}) => {
  // Generate a procedural rig for fallback or immediate display
  const proceduralRig = useMemo(() => {
    return createProceduralHumanoid({ height, build, skinColor })
  }, [height, build, skinColor])

  // If no URL, immediately notify parent of procedural rig
  useEffect(() => {
    if (!url) {
      onLoad?.(proceduralRig)
    }
  }, [url, proceduralRig, onLoad])

  if (!url) {
    return <primitive object={proceduralRig.root} />
  }

  return (
    <Suspense fallback={<primitive object={proceduralRig.root} />}>
      <GLBModel url={url} onLoad={onLoad} fallbackRig={proceduralRig} />
    </Suspense>
  )
}

/**
 * Internal component to handle async GLB loading via useGLTF
 */
const GLBModel: React.FC<{
  url: string
  onLoad?: (rig: CharacterRig) => void
  fallbackRig: CharacterRig
}> = ({ url, onLoad, fallbackRig }) => {
  try {
    const gltf = useGLTF(url)

    const rig = useMemo(() => {
      return extractRig(gltf.scene as THREE.Group, gltf.animations)
    }, [gltf])

    useEffect(() => {
      onLoad?.(rig)
    }, [rig, onLoad])

    return <primitive object={rig.root} />
  } catch (error) {
    console.error('Failed to load humanoid GLB:', error)
    return <primitive object={fallbackRig.root} />
  }
}
