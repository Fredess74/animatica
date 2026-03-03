import React, { useMemo, useEffect, forwardRef, Suspense } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { glbToCharacterRig, parseGLBResult } from './GLBLoader'
import { createProceduralHumanoid } from './CharacterLoader'
import type { CharacterRig } from './CharacterLoader'

export interface HumanoidProps {
  /** URL to a GLB model. If omitted, a procedural humanoid is used. */
  url?: string
  /** Skin color for procedural humanoid. */
  skinColor?: string
  /** Height for procedural humanoid (default 1.0). */
  height?: number
  /** Build/width factor for procedural humanoid (0.0 to 1.0). */
  build?: number
  /** Callback fired when the rig is ready. */
  onRigLoaded?: (rig: CharacterRig) => void
}

/**
 * Internal component to handle GLB loading logic.
 */
const GLBHumanoid = forwardRef<THREE.Group, HumanoidProps>((props, ref) => {
  const { url, onRigLoaded } = props

  // useGLTF will suspend here while loading
  const gltf = useGLTF(url!)

  const rig = useMemo(() => {
    if (!gltf) return null
    const result = parseGLBResult(gltf.scene, gltf.animations)
    return glbToCharacterRig(result)
  }, [gltf])

  useEffect(() => {
    if (rig) {
      onRigLoaded?.(rig)
    }
  }, [rig, onRigLoaded])

  if (!rig) return null

  return <primitive object={rig.root} ref={ref} />
})

/**
 * Internal component for procedural humanoid fallback.
 */
const ProceduralHumanoid = forwardRef<THREE.Group, HumanoidProps>((props, ref) => {
  const { skinColor, height, build, onRigLoaded } = props
  const rig = useMemo(() =>
    createProceduralHumanoid({ skinColor, height, build }),
    [skinColor, height, build]
  )

  useEffect(() => {
    onRigLoaded?.(rig)
  }, [rig, onRigLoaded])

  return <primitive object={rig.root} ref={ref} />
})

/**
 * Humanoid — Renders a character rig from GLB or procedural primitives.
 * Handles loading states and provides a consistent interface for CharacterRenderer.
 *
 * @component
 */
export const Humanoid = React.memo(forwardRef<THREE.Group, HumanoidProps>((props, ref) => {
  const { url } = props

  // If no URL is provided, jump straight to procedural
  if (!url) {
    return <ProceduralHumanoid {...props} ref={ref} />
  }

  // Use Suspense to handle GLB loading, falling back to procedural during download
  return (
    <Suspense fallback={<ProceduralHumanoid {...props} ref={ref} />}>
      <GLBHumanoid {...props} ref={ref} />
    </Suspense>
  )
}))

Humanoid.displayName = 'Humanoid'
