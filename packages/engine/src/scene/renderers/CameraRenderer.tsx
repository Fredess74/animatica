import React, { useRef } from 'react'
import * as THREE from 'three'
import { PerspectiveCamera, useHelper } from '@react-three/drei'
import { CameraActor } from '../../types'

interface CameraRendererProps {
  /** The camera actor data containing transform, visibility, and properties. */
  actor: CameraActor
  /** Whether this camera is the active viewpoint for the scene. */
  isActive?: boolean
  /** Whether to show the camera helper (frustum wireframe). */
  showHelper?: boolean
}

/**
 * Renders a perspective camera.
 * Can serve as the active viewport or as a visible object in the scene (with helper).
 *
 * @component
 * @example
 * ```tsx
 * <CameraRenderer actor={myCameraActor} isActive={true} />
 * ```
 */
export const CameraRenderer: React.FC<CameraRendererProps> = ({
  actor,
  isActive = false,
  showHelper = true,
}) => {
  const camRef = useRef<THREE.PerspectiveCamera>(null)
  const { transform, visible, properties } = actor
  const { fov, near, far } = properties

  // Show helper only if visible, helper is requested, AND it's NOT the active camera
  useHelper(
    showHelper && visible && !isActive ? (camRef as React.RefObject<THREE.Object3D>) : null,
    THREE.CameraHelper
  )

  if (!visible) return null

  return (
    <PerspectiveCamera
      makeDefault={isActive}
      ref={camRef}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      fov={fov}
      near={near}
      far={far}
    />
  )
}
