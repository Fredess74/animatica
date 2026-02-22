import React, { useRef } from 'react'
import * as THREE from 'three'
import { PerspectiveCamera, useHelper } from '@react-three/drei'
import { CameraActor } from '../../types'

interface CameraRendererProps {
  actor: CameraActor
  isActive?: boolean
}

export const CameraRenderer: React.FC<CameraRendererProps> = ({
  actor,
  isActive = false,
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!)

  const { transform, visible, properties } = actor
  const { fov, near, far } = properties

  // Only show helper if the actor is visible
  // Passing null/undefined to useHelper prevents/removes the helper
  useHelper(visible ? cameraRef : undefined, THREE.CameraHelper)

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={isActive}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      fov={fov}
      near={near}
      far={far}
    />
  )
}
