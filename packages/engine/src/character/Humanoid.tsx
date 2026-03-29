/**
 * Humanoid — R3F component representing a character's 3D representation.
 * Integrates CharacterAnimator, BoneController, FaceMorphController, and EyeController.
 *
 * @module @animatica/engine/character/Humanoid
 */
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterRig } from './CharacterLoader';
import { CharacterAnimator } from './CharacterAnimator';
import { BoneController } from './BoneController';
import { FaceMorphController, BlendShapeValues } from './FaceMorphController';
import { EyeController } from './EyeController';
import {
    createDanceClip,
    createIdleClip,
    createJumpClip,
    createRunClip,
    createSitClip,
    createTalkClip,
    createWalkClip,
    createWaveClip,
} from './CharacterAnimator';
import type { CharacterActor } from '../types';

/**
 * Static scratch variables for performance.
 */
const _headPos = new THREE.Vector3();

interface HumanoidProps {
    /** The character actor data (state, pose, animation). */
    actor: CharacterActor;
    /** The character rig (procedural or loaded GLB). */
    rig: CharacterRig;
    /** Optional selection indicator. */
    isSelected?: boolean;
}

/**
 * Humanoid component.
 * Manages the character's skeletal and facial animations.
 */
export const Humanoid = forwardRef<THREE.Group, HumanoidProps>(({
    actor,
    rig,
    isSelected = false,
}, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const animatorRef = useRef<CharacterAnimator | null>(null);
    const boneControllerRef = useRef<BoneController | null>(null);
    const faceMorphRef = useRef<FaceMorphController | null>(null);
    const eyeControllerRef = useRef<EyeController | null>(null);

    // Expose the group ref to parent components
    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    // Initialize controllers
    useEffect(() => {
        if (!rig.root) return;

        // Animator
        const animator = new CharacterAnimator(rig.root);
        animator.registerClip('idle', createIdleClip());
        animator.registerClip('walk', createWalkClip());
        animator.registerClip('run', createRunClip());
        animator.registerClip('talk', createTalkClip());
        animator.registerClip('wave', createWaveClip());
        animator.registerClip('dance', createDanceClip());
        animator.registerClip('sit', createSitClip());
        animator.registerClip('jump', createJumpClip());
        animatorRef.current = animator;

        // Bone Controller
        const boneController = new BoneController(rig.bones);
        boneControllerRef.current = boneController;

        // Face Morph Controller
        const faceMorph = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap);
        faceMorphRef.current = faceMorph;

        // Eye Controller
        const eyeController = new EyeController();
        eyeControllerRef.current = eyeController;

        return () => {
            animator.dispose();
            boneController.reset();
            faceMorph.reset();
        };
    }, [rig]);

    // Handle character state changes (animation, pose, expressions)
    // Dependency on controller instances ensures state is re-applied if rig/controllers change
    useEffect(() => {
        const animator = animatorRef.current;
        if (animator && actor.animation) {
            animator.play(actor.animation);
        }
    }, [actor.animation, animatorRef.current]);

    useEffect(() => {
        const animator = animatorRef.current;
        if (animator && actor.animationSpeed !== undefined) {
            animator.setSpeed(actor.animationSpeed);
        }
    }, [actor.animationSpeed, animatorRef.current]);

    useEffect(() => {
        const boneController = boneControllerRef.current;
        if (boneController && actor.bodyPose) {
            boneController.setPose(actor.bodyPose);
        }
    }, [actor.bodyPose, boneControllerRef.current]);

    useEffect(() => {
        const faceMorph = faceMorphRef.current;
        if (faceMorph && actor.morphTargets) {
            const blendValues: BlendShapeValues = {};
            if (actor.morphTargets.mouthSmile !== undefined) blendValues.mouthSmileLeft = blendValues.mouthSmileRight = actor.morphTargets.mouthSmile;
            if (actor.morphTargets.mouthOpen !== undefined) blendValues.jawOpen = actor.morphTargets.mouthOpen;
            if (actor.morphTargets.browInnerUp !== undefined) blendValues.browInnerUp = actor.morphTargets.browInnerUp;
            if (actor.morphTargets.eyeBlinkLeft !== undefined) blendValues.eyeBlinkLeft = actor.morphTargets.eyeBlinkLeft;
            if (actor.morphTargets.eyeBlinkRight !== undefined) blendValues.eyeBlinkRight = actor.morphTargets.eyeBlinkRight;

            faceMorph.setTarget(blendValues);
        }
    }, [actor.morphTargets, faceMorphRef.current]);

    // Main animation update loop
    useFrame((_state, delta) => {
        // Skeletal animation (from clips)
        if (animatorRef.current) {
            animatorRef.current.update(delta);
        }

        // Procedural bone overrides (from bodyPose)
        if (boneControllerRef.current) {
            boneControllerRef.current.update(delta);
        }

        // Facial expressions
        if (faceMorphRef.current) {
            faceMorphRef.current.update(delta);
        }

        // Eye movements and blinking
        if (eyeControllerRef.current && faceMorphRef.current) {
            const headPos = groupRef.current
                ? _headPos.setFromMatrixPosition(groupRef.current.matrixWorld)
                : undefined;
            const eyeValues = eyeControllerRef.current.update(delta, headPos);
            faceMorphRef.current.setImmediate(eyeValues);
        }
    });

    return (
        <group ref={groupRef} name={actor.id}>
            {/* The actual 3D object from the rig */}
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
        </group>
    );
});

Humanoid.displayName = 'Humanoid';
