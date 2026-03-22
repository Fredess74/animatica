/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Orchestrates animations, face morphs, and eye tracking for a Humanoid.
 *
 * @module @animatica/engine/scene/renderers/CharacterRenderer
 */
import React, { useEffect, useRef, useMemo, memo, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    CharacterAnimator,
    createDanceClip,
    createIdleClip,
    createJumpClip,
    createRunClip,
    createSitClip,
    createTalkClip,
    createWalkClip,
    createWaveClip,
    FaceMorphController,
    EyeController,
    getPreset,
    Humanoid,
    type CharacterRig,
} from '../../character';
import type { CharacterActor } from '../../types';

interface CharacterRendererProps {
    /** The character actor data containing transform, visibility, and properties. */
    actor: CharacterActor;
    /** Whether this character is currently selected in the editor. */
    isSelected?: boolean;
    /** Callback when the character is clicked. */
    onClick?: () => void;
}

/**
 * Renders a character actor using the Humanoid base component.
 * Manages skeletal animations, facial expressions, and procedural behaviors.
 *
 * @component
 */
export const CharacterRenderer: React.FC<CharacterRendererProps> = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
    actor,
    isSelected = false,
    onClick,
}, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    useImperativeHandle(ref, () => groupRef.current!);

    const animatorRef = useRef<CharacterAnimator | null>(null);
    const faceMorphRef = useRef<FaceMorphController | null>(null);
    const eyeControllerRef = useRef<EyeController | null>(null);

    // Get preset configuration for fallback properties
    const preset = useMemo(() => getPreset(actor.name.toLowerCase()), [actor.name]);
    const skinColor = preset?.body.skinColor || '#D4A27C';
    const height = preset?.body.height || 1.0;
    const build = preset?.body.build || 0.5;

    // We pre-allocate Vector3 for the update loop to avoid GC pressure
    const tempHeadPos = useMemo(() => new THREE.Vector3(), []);

    // Stable callback to initialize the rig and controllers
    const handleRigReady = useCallback((rig: CharacterRig) => {
        if (!rig.root) return;

        // Cleanup previous animator/controllers if they exist
        if (animatorRef.current) animatorRef.current.dispose();

        // Create animator
        const animator = new CharacterAnimator(rig.root);
        animator.registerClip('idle', createIdleClip());
        animator.registerClip('walk', createWalkClip());
        animator.registerClip('run', createRunClip());
        animator.registerClip('talk', createTalkClip());
        animator.registerClip('wave', createWaveClip());
        animator.registerClip('dance', createDanceClip());
        animator.registerClip('sit', createSitClip());
        animator.registerClip('jump', createJumpClip());

        animator.play(actor.animation || 'idle');
        animatorRef.current = animator;

        // Setup face morph controller
        const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap);
        faceMorphRef.current = faceMorph;

        // Setup eye controller
        const eyeController = new EyeController();
        eyeControllerRef.current = eyeController;
    }, []);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            if (animatorRef.current) animatorRef.current.dispose();
            animatorRef.current = null;
            faceMorphRef.current = null;
            eyeControllerRef.current = null;
        };
    }, []);

    // Update animations and morphs when actor state changes
    useEffect(() => {
        if (animatorRef.current && actor.animation) {
            animatorRef.current.play(actor.animation);
        }
    }, [actor.animation]);

    useEffect(() => {
        if (animatorRef.current && actor.animationSpeed !== undefined) {
            animatorRef.current.setSpeed(actor.animationSpeed);
        }
    }, [actor.animationSpeed]);

    useEffect(() => {
        if (faceMorphRef.current && actor.morphTargets) {
            faceMorphRef.current.setTarget(actor.morphTargets);
        }
    }, [actor.morphTargets]);

    // Frame update loop
    useFrame((_state, delta) => {
        if (animatorRef.current) {
            animatorRef.current.update(delta);
        }

        if (faceMorphRef.current) {
            faceMorphRef.current.update(delta);
        }

        if (eyeControllerRef.current && faceMorphRef.current && groupRef.current) {
            groupRef.current.getWorldPosition(tempHeadPos);
            const eyeValues = eyeControllerRef.current.update(delta, tempHeadPos);
            faceMorphRef.current.setImmediate(eyeValues);
        }
    });

    if (!actor.visible) return null;

    return (
        <group
            ref={groupRef}
            name={`actor-${actor.id}`}
            position={actor.transform.position}
            rotation={actor.transform.rotation}
            scale={actor.transform.scale}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            {/* Base Humanoid model */}
            <Humanoid
                url={actor.avatarUrl}
                skinColor={skinColor}
                height={height}
                build={build}
                onRigReady={handleRigReady}
            />

            {/* Selection indicator */}
            {isSelected && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[0.45, 0.55, 32]} />
                    <meshBasicMaterial color="#16A34A" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
}));

CharacterRenderer.displayName = 'CharacterRenderer';
