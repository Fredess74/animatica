import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useHelper } from '@react-three/drei'
import { LightActor } from '../../types'
import { DesignTokens } from '../../design/tokens'

interface LightRendererProps {
  actor: LightActor
  showHelper?: boolean
}

export const LightRenderer: React.FC<LightRendererProps> = ({
  actor,
  showHelper = false,
}) => {
  const lightRef = useRef<THREE.Light>(null)
  // We use a dedicated target object for Spot and Directional lights
  // Placed at (0,0,-1) in local space, so rotating the parent group aims the light.
  const target = useMemo(() => new THREE.Object3D(), [])

  const { transform, visible, properties } = actor
  const { lightType, intensity, color, castShadow } = properties

  const HelperClass = getHelperClass(lightType)

  ;(useHelper as any)(
    showHelper && visible && HelperClass ? lightRef : null,
    HelperClass as any,
    lightType === 'directional' ? 1 : 0.5, // helper size
    DesignTokens.color.primary
  )

  if (!visible) return null

  return (
    <group
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    >
      <primitive object={target} position={[0, 0, -1]} />

      {lightType === 'point' && (
        <pointLight
          ref={lightRef as any}
          intensity={intensity}
          color={color}
          castShadow={castShadow}
        />
      )}
      {lightType === 'spot' && (
        <spotLight
          ref={lightRef as any}
          intensity={intensity}
          color={color}
          castShadow={castShadow}
          angle={Math.PI / 6}
          target={target}
        />
      )}
      {lightType === 'directional' && (
        <directionalLight
          ref={lightRef as any}
          intensity={intensity}
          color={color}
          castShadow={castShadow}
          target={target}
        />
      )}
    </group>
  )
}

function getHelperClass(type: string) {
  switch (type) {
    case 'point':
      return THREE.PointLightHelper
    case 'spot':
      return THREE.SpotLightHelper
    case 'directional':
      return THREE.DirectionalLightHelper
    default:
      return null
  }
}
