import React, { useRef } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { PrimitiveActor } from '../../types'

interface PrimitiveRendererProps {
  /** The actor data containing transform, visibility, and properties. */
  actor: PrimitiveActor
  /** Whether the actor is currently selected in the editor. */
  isSelected?: boolean
  /** Callback for when the actor is clicked. */
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

/**
 * Renders a primitive shape (box, sphere, cylinder, etc.) based on the actor's properties.
 * Handles selection highlighting with an edges geometry.
 *
 * @component
 * @example
 * ```tsx
 * <PrimitiveRenderer actor={myBoxActor} isSelected={true} />
 * ```
 */
export const PrimitiveRenderer: React.FC<PrimitiveRendererProps> = React.memo(({
  actor,
  isSelected = false,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null)

  const { transform, visible, properties } = actor
  const { shape, color, roughness, metalness, opacity, wireframe } = properties

  if (!visible) return null

  const getGeometry = () => {
    switch (shape) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
      case 'plane':
        return <planeGeometry args={[1, 1]} />
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 100]} />
      case 'capsule':
        return <capsuleGeometry args={[0.5, 1, 4, 8]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      {getGeometry()}
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        opacity={opacity}
        transparent={opacity < 1}
        wireframe={wireframe}
      />
      {isSelected && <Edges color="yellow" threshold={15} />}
    </mesh>
  )
})
