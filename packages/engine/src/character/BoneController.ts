/**
 * BoneController — Maps abstract BodyPose data to character skeleton bones.
 * Handles bone lookups and smooth rotation interpolation.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three';
import type { CharacterRig } from './CharacterLoader';
import type { BodyPose } from '../types';

/**
 * Configuration for bone mapping.
 */
const BONE_MAPPING: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
};

// Reusable scratch variables to minimize GC pressure in the animation loop
const SCRATCH_EULER = new THREE.Euler();
const SCRATCH_QUATERNION = new THREE.Quaternion();

export class BoneController {
    private rig: CharacterRig;
    private lerpSpeed: number = 10.0; // Radians per second or similar alpha factor

    constructor(rig: CharacterRig) {
        this.rig = rig;
    }

    /**
     * Update bone rotations based on the provided pose.
     * @param pose The target body pose.
     * @param delta Time since last frame in seconds.
     */
    update(pose: BodyPose, delta: number): void {
        const bones = this.rig.bones;
        const alpha = Math.min(1 - Math.exp(-this.lerpSpeed * delta), 1);

        for (const [poseKey, boneName] of Object.entries(BONE_MAPPING)) {
            const rotation = pose[poseKey as keyof BodyPose];
            const bone = bones.get(boneName);

            if (!bone || !rotation) continue;

            // Convert Euler rotation (radians) to Quaternion using scratch objects
            SCRATCH_EULER.set(rotation[0], rotation[1], rotation[2]);
            SCRATCH_QUATERNION.setFromEuler(SCRATCH_EULER);

            // Smoothly interpolate current bone rotation towards target
            bone.quaternion.slerp(SCRATCH_QUATERNION, alpha);
        }
    }

    /**
     * Set the interpolation speed for bone rotations.
     * @param speed The speed factor (default is 10).
     */
    setLerpSpeed(speed: number): void {
        this.lerpSpeed = speed;
    }
}
