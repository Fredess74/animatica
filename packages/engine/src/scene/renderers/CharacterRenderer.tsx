/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Creates a procedural humanoid (or loads GLB), applies animation and expression.
 */
import React, { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createProceduralHumanoid } from '../character/CharacterLoader'
import { CharacterAnimator, createIdleClip, createWalkClip } from '../character/CharacterAnimator'
import { getPreset } from '../character/CharacterPresets'
import type { CharacterActor, Vector3 } from '../types'

interface CharacterRendererProps {
  actor: CharacterActor
  isSelected?: boolean
  onClick?: () => void
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  actor,
  isSelected = false,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const animatorRef = useRef<CharacterAnimator | null>(null)

  // Build character rig
  const rig = useMemo(() => {
    // Try to get preset for skin color
    const preset = getPreset(actor.name.toLowerCase())
    const skinColor = preset?.body.skinColor || '#D4A27C'
    const height = preset?.body.height || 1.0
    const build = preset?.body.build || 0.5

    return createProceduralHumanoid({ skinColor, height, build })
  }, [actor.name])

  // Setup animator
  useEffect(() => {
    if (!rig.root) return

    const animator = new CharacterAnimator(rig.root)

    // Register procedural animations
    animator.registerClip('idle', createIdleClip())
    animator.registerClip('walk', createWalkClip())

    // Play initial animation
    animator.play(actor.animation || 'idle')

    animatorRef.current = animator

    return () => {
      animator.dispose()
    }
  }, [rig, actor.animation])

  // Update animation on state change
  useEffect(() => {
    if (animatorRef.current && actor.animation) {
      animatorRef.current.play(actor.animation as any)
    }
  }, [actor.animation])

  // Update animation speed
  useEffect(() => {
    if (animatorRef.current && actor.animationSpeed) {
      animatorRef.current.setSpeed(actor.animationSpeed)
    }
  }, [actor.animationSpeed])

  // Frame update
  useFrame((_, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta)
    }
  })

  // Selection outline effect (green tint)
  const outlineColor = isSelected ? '#22C55E' : undefined

  return (
    <group
      ref={groupRef}
      name={actor.id}
      position={actor.transform.position}
      rotation={actor.transform.rotation}
      scale={actor.transform.scale}
      visible={actor.visible}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {/* Character rig */}
      <primitive object={rig.root} />

      {/* Selection indicator ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial
            color="#22C55E"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Name label (optional, for editor visibility) */}
      {isSelected && (
        <sprite position={[0, 2, 0]} scale={[1.5, 0.3, 1]}>
          <spriteMaterial
            transparent
            opacity={0.8}
            color="#22C55E"
          />
        </sprite>
      )}
    </group>
  )
}
