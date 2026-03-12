/**
 * Humanoid — R3F component that renders a rigged humanoid character.
 * It can load an external GLB (e.g. Ready Player Me) or use a procedural fallback.
 * Manages skeletal animation, facial morphs, and eye tracking.
 */
import React, { useMemo, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createProceduralHumanoid, extractRig } from './CharacterLoader';
import {
    CharacterAnimator,
    createIdleClip,
    createWalkClip,
    createRunClip,
    createTalkClip,
    createWaveClip,
    createDanceClip,
    createSitClip,
    createJumpClip,
    AnimState
} from './CharacterAnimator';
import { FaceMorphController, BlendShapeValues } from './FaceMorphController';
import { EyeController } from './EyeController';
import { getPreset } from './CharacterPresets';
import { CharacterActor } from '../types';

interface HumanoidProps {
    actor: CharacterActor;
}

// Pre-allocate to avoid GC in update loop
const _tempVector = new THREE.Vector3();

/**
 * Shared logic for both GLB and Procedural humanoids.
 */
function useHumanoidControllers(rig: any, actor: CharacterActor, groupRef: React.RefObject<THREE.Group | null>) {
    const animatorRef = useRef<CharacterAnimator | null>(null);
    const faceMorphRef = useRef<FaceMorphController | null>(null);
    const eyeControllerRef = useRef<EyeController | null>(null);

    // Initialize controllers
    useEffect(() => {
        if (!rig.root) return;

        const animator = new CharacterAnimator(rig.root);
        // Register standard clips
        animator.registerClip('idle', createIdleClip());
        animator.registerClip('walk', createWalkClip());
        animator.registerClip('run', createRunClip());
        animator.registerClip('talk', createTalkClip());
        animator.registerClip('wave', createWaveClip());
        animator.registerClip('dance', createDanceClip());
        animator.registerClip('sit', createSitClip());
        animator.registerClip('jump', createJumpClip());

        // Register clips embedded in GLB if any
        if (rig.animations) {
            rig.animations.forEach((clip: THREE.AnimationClip) => {
                animator.registerClip(clip.name as AnimState, clip);
            });
        }

        animator.play(actor.animation || 'idle');
        animatorRef.current = animator;

        // Face morphs
        if (rig.bodyMesh && rig.morphTargetMap) {
            faceMorphRef.current = new FaceMorphController(rig.bodyMesh, rig.morphTargetMap);
        }

        // Eye tracking
        eyeControllerRef.current = new EyeController();

        return () => {
            animator.dispose();
        };
    }, [rig, actor.animation]); // Re-init if rig changes or initial animation

    // React to animation changes
    useEffect(() => {
        if (animatorRef.current && actor.animation) {
            animatorRef.current.play(actor.animation);
        }
    }, [actor.animation]);

    // React to speed changes
    useEffect(() => {
        if (animatorRef.current && actor.animationSpeed !== undefined) {
            animatorRef.current.setSpeed(actor.animationSpeed);
        }
    }, [actor.animationSpeed]);

    // React to morph target changes
    useEffect(() => {
        if (faceMorphRef.current && actor.morphTargets) {
            faceMorphRef.current.setTarget(actor.morphTargets as BlendShapeValues);
        }
    }, [actor.morphTargets]);

    // Update loop
    useFrame((_state, delta) => {
        if (animatorRef.current) {
            animatorRef.current.update(delta);
        }

        if (faceMorphRef.current) {
            faceMorphRef.current.update(delta);
        }

        if (eyeControllerRef.current && faceMorphRef.current) {
            const headPos = groupRef.current
                ? _tempVector.setFromMatrixPosition(groupRef.current.matrixWorld)
                : undefined;
            const eyeValues = eyeControllerRef.current.update(delta, headPos);
            faceMorphRef.current.setImmediate(eyeValues);
        }

        // Apply body pose
        if (actor.bodyPose && rig.bones) {
            Object.entries(actor.bodyPose).forEach(([boneName, rotation]) => {
                const bone = rig.bones.get(boneName);
                if (bone && rotation) {
                    bone.rotation.set(rotation[0], rotation[1], rotation[2]);
                }
            });
        }
    });

    return { animatorRef, faceMorphRef, eyeControllerRef };
}

/**
 * Internal component to handle GLTF loading and rig extraction.
 */
const HumanoidModel: React.FC<HumanoidProps> = ({ actor }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(actor.modelUrl!) as any;

    const rig = useMemo(() => {
        if (scene) return extractRig(scene, animations);
        return null;
    }, [scene, animations]);

    useHumanoidControllers(rig, actor, groupRef);

    if (!rig) return null;

    return (
        <group ref={groupRef}>
            <primitive object={rig.root} />
        </group>
    );
};

/**
 * Procedural Fallback component when no GLB is used.
 */
const ProceduralHumanoid: React.FC<HumanoidProps> = ({ actor }) => {
    const groupRef = useRef<THREE.Group>(null);

    const rig = useMemo(() => {
        const preset = getPreset(actor.id) || getPreset('default-human');
        const skinColor = preset?.body.skinColor || '#D4A27C';
        const height = preset?.body.height || 1.0;
        const build = preset?.body.build || 0.5;

        return createProceduralHumanoid({ skinColor, height, build });
    }, [actor.id]);

    useHumanoidControllers(rig, actor, groupRef);

    return (
        <group ref={groupRef}>
            <primitive object={rig.root} />
        </group>
    );
};

export const Humanoid: React.FC<HumanoidProps> = (props) => {
    if (props.actor.modelUrl) {
        return (
            <Suspense fallback={<ProceduralHumanoid {...props} />}>
                <HumanoidModel {...props} />
            </Suspense>
        );
    }

    return <ProceduralHumanoid {...props} />;
};
