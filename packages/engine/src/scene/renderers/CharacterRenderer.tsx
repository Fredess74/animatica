/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Wraps the Humanoid component and maps actor properties to its props.
 * Handles selection indicators and actor-specific logic.
 */
import React, { memo, forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { Humanoid } from '../../character/Humanoid'
import { getPreset } from '../../character/CharacterPresets'
import type { CharacterActor } from '../../types'

interface CharacterRendererProps {
  /** The character actor data from the store. */
  actor: CharacterActor
  /** Whether the actor is currently selected in the editor. */
  isSelected?: boolean
  /** Callback for when the character is clicked. */
  onClick?: () => void
}

/**
 * CharacterRenderer — Orchestrates character rendering for the scene.
 * It uses the Humanoid base component for the core character rig and animation,
 * and adds editor-specific features like selection rings.
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>((props, ref) => {
  const {
    actor,
    isSelected = false,
    onClick,
  } = props
  const groupRef = useRef<THREE.Group>(null)

  // Exposed for parent access
  useImperativeHandle(ref, () => groupRef.current!)

  const { transform, visible, animation, animationSpeed, morphTargets, name } = actor

  // Get preset defaults for procedural fallback
  const preset = getPreset(name.toLowerCase())
  const skinColor = preset?.body.skinColor || '#D4A27C'
  const height = preset?.body.height || 1.0
  const build = preset?.body.build || 0.5

  if (!visible) return null

  return (
    <group
      ref={groupRef}
      name={actor.id}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {/* Humanoid rig with animation and morphs */}
      <Humanoid
        skinColor={skinColor}
        height={height}
        build={build}
        animation={animation}
        animationSpeed={animationSpeed}
        morphTargets={morphTargets}
      />

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
    </group>
  )
}))

CharacterRenderer.displayName = 'CharacterRenderer'
