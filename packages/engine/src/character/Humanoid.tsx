"use client";

import React, { Suspense, useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createProceduralHumanoid, extractRig } from './CharacterLoader';
import { CharacterAnimator, createIdleClip } from './CharacterAnimator';
import type { AnimState } from './CharacterAnimator';
import type { Vector3 } from '../types';

export interface HumanoidProps {
  /** URL of the GLB model to load. */
  url?: string;
  /** Name of the animation to play. */
  animation?: AnimState;
  /** Position in 3D space. */
  position?: Vector3;
  /** Rotation in Euler angles (radians). */
  rotation?: Vector3;
  /** Scale multiplier. */
  scale?: Vector3 | number;
  /** Whether the character is visible. */
  visible?: boolean;
}

/**
 * Humanoid — The base component for humanoid characters.
 * Loads a GLB model via useGLTF with a procedural fallback.
 * Displays idle animation by default.
 *
 * @component
 */
export const Humanoid: React.FC<HumanoidProps> = ({
  url,
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
}) => {
  return (
    <ErrorBoundary fallback={<ProceduralFallback position={position} rotation={rotation} scale={scale} />}>
      <Suspense fallback={<ProceduralFallback position={position} rotation={rotation} scale={scale} />}>
        {url ? (
          <GLBModel
            url={url}
            animation={animation}
            position={position}
            rotation={rotation}
            scale={scale}
            visible={visible}
          />
        ) : (
          <ProceduralFallback position={position} rotation={rotation} scale={scale} />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Internal component to handle GLB loading, rig extraction, and animation.
 */
const GLBModel: React.FC<HumanoidProps & { url: string }> = ({
  url,
  animation = 'idle',
  position,
  rotation,
  scale,
  visible,
}) => {
  const { scene, animations } = useGLTF(url);
  const animatorRef = useRef<CharacterAnimator | null>(null);

  const rig = useMemo(() => extractRig(scene as THREE.Group, animations), [scene, animations]);

  useEffect(() => {
    if (!rig.root) return;

    const animator = new CharacterAnimator(rig.root);
    // Register default idle
    animator.registerClip('idle', createIdleClip());

    // Register animations from GLB
    rig.animations.forEach(clip => {
      animator.registerClip(clip.name as AnimState, clip);
    });

    animatorRef.current = animator;

    return () => {
      animator.dispose();
      animatorRef.current = null;
    };
  }, [rig]);

  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.play(animation);
    }
  }, [animation]);

  useFrame((_state, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta);
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      visible={visible}
    >
      <primitive object={rig.root} />
    </group>
  );
};

/**
 * Fallback component that renders a procedural humanoid rig with idle animation.
 */
const ProceduralFallback: React.FC<Pick<HumanoidProps, 'position' | 'rotation' | 'scale' | 'animation'>> = ({
  position,
  rotation,
  scale,
  animation = 'idle',
}) => {
  const animatorRef = useRef<CharacterAnimator | null>(null);
  const rig = useMemo(() => createProceduralHumanoid({ skinColor: '#16A34A' }), []);

  useEffect(() => {
    if (!rig.root) return;

    const animator = new CharacterAnimator(rig.root);
    animator.registerClip('idle', createIdleClip());
    animatorRef.current = animator;

    return () => {
      animator.dispose();
      animatorRef.current = null;
    };
  }, [rig]);

  useEffect(() => {
    if (animatorRef.current) {
      // Procedural fallback currently only supports 'idle'
      animatorRef.current.play('idle');
    }
  }, [animation]);

  useFrame((_state, delta) => {
    if (animatorRef.current) {
      animatorRef.current.update(delta);
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
    >
      <primitive object={rig.root} />
    </group>
  );
};

/**
 * Simple ErrorBoundary for catching GLTF loading errors.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
