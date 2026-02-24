import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useHelper } from '@react-three/drei'
import { LightActor } from '../../types'

interface LightRendererProps {
  /** The light actor data containing transform, visibility, and properties. */
  actor: LightActor
  /** Whether to show the visual helper (gizmo) for the light source. */
  showHelper?: boolean
}

/**
 * Renders a light source (point, spot, or directional) with optional debug helpers.
 * Handles target positioning for directional and spot lights.
 *
 * @component
 * @example
 * ```tsx
 * <LightRenderer actor={myLightActor} showHelper={true} />
 * ```
 */
export const LightRenderer: React.FC<LightRendererProps> = React.memo(({
  actor,
  showHelper = false,
}) => {
  // Use a union type for the ref to satisfy all light types and MutableRefObject
  const lightRef = useRef<THREE.Light | null>(null)

  // We use a dedicated target object for Spot and Directional lights
  // Placed at (0,0,-1) in local space, so rotating the parent group aims the light.
  const target = useMemo(() => new THREE.Object3D(), [])

  const { transform, visible, properties } = actor
  const { lightType, intensity, color, castShadow } = properties

  const HelperClass = getHelperClass(lightType);
  // Pad args to constant length to satisfy React Hook rules (useHelper dependencies)
  const helperArgs = lightType === 'spot'
    ? ['yellow', undefined]
    : [lightType === 'directional' ? 1 : 0.5, 'yellow'];

  // useHelper expects a MutableRefObject or Object3D.
  // We cast the hook to unknown to avoid strict type checks on the helper constructor arguments
  // or ref type mismatches in some TS versions, but we try to keep it clean.
  (useHelper as any)(
    (showHelper && visible && HelperClass ? lightRef : undefined),
    HelperClass,
    ...helperArgs
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
          ref={lightRef as React.Ref<THREE.PointLight>}
          intensity={intensity}
          color={color}
          castShadow={castShadow}
        />
      )}
      {lightType === 'spot' && (
        <spotLight
          ref={lightRef as React.Ref<THREE.SpotLight>}
          intensity={intensity}
          color={color}
          castShadow={castShadow}
          angle={Math.PI / 6}
          target={target}
        />
      )}
      {lightType === 'directional' && (
        <directionalLight
          ref={lightRef as React.Ref<THREE.DirectionalLight>}
          intensity={intensity}
          color={color}
          castShadow={castShadow}
          target={target}
        />
      )}
    </group>
  )
})

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
