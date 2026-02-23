import React, { useRef } from 'react'
import * as THREE from 'three'
import { PerspectiveCamera, useHelper } from '@react-three/drei'
import { CameraActor } from '../../types'

interface CameraRendererProps {
  actor: CameraActor
  isActive?: boolean
  showHelper?: boolean
}

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
    showHelper && visible && !isActive ? (camRef as any) : null,
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
