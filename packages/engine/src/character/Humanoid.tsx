import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CharacterAnimator, createIdleClip } from './CharacterAnimator';
import { extractRig } from './CharacterLoader';

interface HumanoidProps {
    /** URL to the GLB model. */
    url: string;
    /** Current animation state. */
    animation?: 'idle' | 'walk' | 'run' | 'talk' | 'wave' | 'dance' | 'sit' | 'jump';
    /** Playback speed. */
    speed?: number;
}

/**
 * Fallback component when the model is loading or fails.
 * Renders a simple box representing the character.
 */
const CharacterFallback: React.FC = () => (
    <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.2]} />
        <meshStandardMaterial color="#404040" />
    </mesh>
);

/**
 * Humanoid — Renders a GLB-based character model with skeletal animation.
 * Optimized for ReadyPlayerMe and standard humanoid rigs.
 */
const HumanoidContent: React.FC<HumanoidProps> = ({ url, animation = 'idle', speed = 1.0 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const animatorRef = useRef<CharacterAnimator | null>(null);

    // Load GLTF
    const { scene, animations } = useGLTF(url);

    // Extract rig and setup animator
    const rig = useMemo(() => {
        if (!scene) return null;
        return extractRig(scene, animations);
    }, [scene, animations]);

    useEffect(() => {
        if (!rig || !rig.root) return;

        const animator = new CharacterAnimator(rig.root);

        // Register standard clips
        animator.registerClip('idle', createIdleClip());

        // Register clips from the GLB if available
        rig.animations.forEach((clip) => {
            // Map common clip names to our AnimState if possible
            const name = clip.name.toLowerCase();
            if (name.includes('idle')) animator.registerClip('idle', clip);
            if (name.includes('walk')) animator.registerClip('walk', clip);
            if (name.includes('run')) animator.registerClip('run', clip);
        });

        animator.play(animation);
        animator.setSpeed(speed);
        animatorRef.current = animator;

        return () => {
            animator.dispose();
        };
    }, [rig, animation, speed]);

    // Update animation loop
    useFrame((_state, delta) => {
        if (animatorRef.current) {
            animatorRef.current.update(delta);
        }
    });

    if (!rig) return <CharacterFallback />;

    return <primitive object={rig.root} />;
};

/**
 * Humanoid — Component with built-in Suspense and error handling.
 */
export const Humanoid: React.FC<HumanoidProps> = (props) => {
    if (!props.url) {
        return <CharacterFallback />;
    }

    return (
        <Suspense fallback={<CharacterFallback />}>
            <HumanoidContent {...props} />
        </Suspense>
    );
};
