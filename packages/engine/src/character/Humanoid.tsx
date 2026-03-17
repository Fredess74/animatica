/**
 * Humanoid — Base character component for loading and animating humanoid models.
 * Supports GLB loading with useGLTF and falls back to a procedural rig.
 * Automatically initializes the CharacterAnimator for idle animations.
 *
 * @module @animatica/engine/character/Humanoid
 */
import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createProceduralHumanoid, extractRig, type CharacterRig } from './CharacterLoader';
import { CharacterAnimator, createIdleClip } from './CharacterAnimator';
import type { CharacterActor } from '../types';

interface HumanoidProps {
  /** URL of the GLB model to load. */
  url?: string;
  /** Optional actor data for initial state. */
  actor?: CharacterActor;
  /** Callback when the model is fully loaded. */
  onLoad?: (rig: CharacterRig) => void;
  /** Callback if loading fails. */
  onError?: (error: Error) => void;
}

/**
 * Humanoid Component — The primary character renderer for Animatica.
 * Handles GLB assets and procedural fallbacks.
 *
 * @component
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  url,
  actor,
  onLoad,
  onError,
}) => {
  const animatorRef = useRef<CharacterAnimator | null>(null);

  // Attempt to load GLTF if URL is provided
  const gltf = url ? useGLTF(url) : null;

  // Compute the character rig (loaded or procedural)
  const rig = useMemo(() => {
    try {
      if (gltf) {
        const extracted = extractRig(gltf.scene, gltf.animations);
        onLoad?.(extracted);
        return extracted;
      }
    } catch (err) {
      console.error('[Humanoid] Failed to extract rig from GLB:', err);
      onError?.(err as Error);
    }

    // Fallback to procedural humanoid
    // Uses Retro Futurism 71 color: green-600 (#16A34A) as a fallback accent if needed
    return createProceduralHumanoid({
      skinColor: '#16A34A', // Using primary brand color for fallback
      height: 1.0,
      build: 0.5,
    });
  }, [gltf, onLoad, onError]);

  // Initialize Animator
  useEffect(() => {
    if (!rig.root) return;

    const animator = new CharacterAnimator(rig.root);
    animator.registerClip('idle', createIdleClip());
    animator.play('idle');
    animatorRef.current = animator;

    return () => {
      animator.dispose();
    };
  }, [rig]);

  // Update animation frame
  useFrame((_state, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta);
    }
  });

  return (
    <group name={actor?.id || 'humanoid-root'}>
      <primitive object={rig.root} />
    </group>
  );
};

// Pre-load default models if any are frequently used
// useGLTF.preload('/models/default-humanoid.glb');
