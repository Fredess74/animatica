/**
 * BoneController — Maps BodyPose properties to skeleton bone rotations.
 * Implements frame-rate independent rotation smoothing using quaternions.
 *
 * @module @animatica/engine/character/BoneController
 */
import * as THREE from 'three';
import type { BodyPose, Vector3 } from '../types';

/**
 * Static scratch variables to reduce GC pressure during update loops.
 */
const _tempEuler = new THREE.Euler();
const _tempQuat = new THREE.Quaternion();

/**
 * Mapping between BodyPose property names and standard Three.js bone names.
 */
const BONE_MAPPING: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
};

/**
 * Controller for bone rotations.
 * Handles mapping BodyPose properties to specific humanoid bones
 * and applies smooth interpolation (slerp) between target and current rotations.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>;
    private targetQuaternions: Map<string, THREE.Quaternion> = new Map();
    private currentQuaternions: Map<string, THREE.Quaternion> = new Map();
    private smoothingAlpha: number = 0.15; // default smoothing factor

    /**
     * @param bones Map of bone names to THREE.Bone objects.
     */
    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones;

        // Initialize current rotations for mapped bones
        for (const boneName of Object.values(BONE_MAPPING)) {
            const bone = this.bones.get(boneName);
            if (bone) {
                this.currentQuaternions.set(boneName, bone.quaternion.clone());
            }
        }
    }

    /**
     * Sets the target pose for the skeleton.
     * @param pose The body pose with Euler rotations (radians).
     */
    setPose(pose: BodyPose): void {
        for (const [prop, rotation] of Object.entries(pose)) {
            const boneName = BONE_MAPPING[prop as keyof BodyPose];
            if (boneName && rotation) {
                // Convert Euler Vector3 to Quaternion for target
                _tempEuler.set(...(rotation as Vector3));
                const target = new THREE.Quaternion().setFromEuler(_tempEuler);
                this.targetQuaternions.set(boneName, target);
            }
        }
    }

    /**
     * Update function to be called on every frame.
     * Applies smoothing (slerp) to bone rotations and updates the skeleton.
     * @param delta Time since last frame in seconds.
     */
    update(delta: number): void {
        // Frame-rate independent smoothing formula: 1 - (1 - alpha)^(delta * 60)
        const alpha = 1 - Math.pow(1 - this.smoothingAlpha, delta * 60);

        for (const [boneName, target] of this.targetQuaternions.entries()) {
            const bone = this.bones.get(boneName);
            if (!bone) continue;

            const current = this.currentQuaternions.get(boneName);
            if (!current) continue;

            // Smoothly interpolate rotations using spherical linear interpolation (slerp)
            current.slerp(target, alpha);

            // Apply to actual bone
            bone.quaternion.copy(current);
        }
    }

    /**
     * Set the smoothing factor (0 = no movement, 1 = immediate).
     * @param alpha The alpha value for interpolation.
     */
    setSmoothing(alpha: number): void {
        this.smoothingAlpha = Math.max(0, Math.min(alpha, 1));
    }

    /**
     * Resets all bone rotations to their default state (identity quaternion).
     */
    reset(): void {
        const identity = new THREE.Quaternion();
        for (const boneName of Object.values(BONE_MAPPING)) {
            const bone = this.bones.get(boneName);
            if (bone) {
                bone.quaternion.copy(identity);
                this.currentQuaternions.get(boneName)?.copy(identity);
            }
        }
        this.targetQuaternions.clear();
    }
}
