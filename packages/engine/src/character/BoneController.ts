/**
 * BoneController — Manages per-bone rotation overrides for character actors.
 * Maps BodyPose properties to specific skeleton bones and applies smooth interpolation.
 *
 * @module @animatica/engine/character/BoneController
 */
import * as THREE from 'three';
import type { BodyPose, Vector3 } from '../types';

// Scratch variables to avoid GC pressure in the update loop
const _euler = new THREE.Euler();
const _quaternion = new THREE.Quaternion();

/**
 * Mapping between BodyPose properties and standard humanoid bone names.
 */
const BONE_MAPPING: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
};

export class BoneController {
    private bones: Map<keyof BodyPose, THREE.Bone> = new Map();
    private targetRotations: Map<keyof BodyPose, THREE.Quaternion> = new Map();
    private lerpSpeed: number = 10.0; // speed of rotation smoothing

    /**
     * @param boneMap A map of all bones in the character's skeleton.
     */
    constructor(boneMap: Map<string, THREE.Bone>) {
        // Initialize bone references based on mapping
        for (const [poseKey, boneName] of Object.entries(BONE_MAPPING)) {
            const bone = boneMap.get(boneName);
            if (bone) {
                this.bones.set(poseKey as keyof BodyPose, bone);
                this.targetRotations.set(poseKey as keyof BodyPose, new THREE.Quaternion().copy(bone.quaternion));
            }
        }
    }

    /**
     * Sets the target pose to reach.
     * @param pose The desired body pose.
     */
    setPose(pose: BodyPose): void {
        for (const [key, rotation] of Object.entries(pose)) {
            const poseKey = key as keyof BodyPose;
            if (rotation && this.targetRotations.has(poseKey)) {
                const [x, y, z] = rotation as Vector3;
                _euler.set(x, y, z);
                this.targetRotations.get(poseKey)!.setFromEuler(_euler);
            }
        }
    }

    /**
     * Updates bone rotations with smooth interpolation.
     * Should be called every frame.
     * @param delta Time since last frame in seconds.
     */
    update(delta: number): void {
        const t = Math.min(delta * this.lerpSpeed, 1.0);

        this.bones.forEach((bone, key) => {
            const target = this.targetRotations.get(key);
            if (target) {
                bone.quaternion.slerp(target, t);
            }
        });
    }

    /**
     * Instantly snaps bones to the target rotations.
     */
    snap(): void {
        this.bones.forEach((bone, key) => {
            const target = this.targetRotations.get(key);
            if (target) {
                bone.quaternion.copy(target);
            }
        });
    }

    /**
     * Sets the smoothing speed.
     * @param speed Units per second.
     */
    setLerpSpeed(speed: number): void {
        this.lerpSpeed = speed;
    }
}
