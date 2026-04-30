import * as THREE from 'three';
import { BodyPose, Vector3 } from '../types';

/**
 * BoneController — Manages manual character posing by mapping abstract BodyPose
 * properties to actual skeleton bone rotations.
 *
 * Supports smooth interpolation between poses using slerp.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>;
    private lerpSpeed = 10;

    // Scratch variables to avoid object churn in the animation loop
    private static readonly _euler = new THREE.Euler();
    private static readonly _quaternion = new THREE.Quaternion();

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones;
    }

    /**
     * Updates bone rotations based on the provided BodyPose.
     * Should be called every frame after the main animation update.
     *
     * @param pose The desired body pose.
     * @param delta Time since last frame in seconds.
     */
    update(pose: BodyPose, delta: number): void {
        if (pose.head) this.applyRotation('Head', pose.head, delta);
        if (pose.spine) this.applyRotation('Spine', pose.spine, delta);
        if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm, delta);
        if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm, delta);
        if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg, delta);
        if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg, delta);
    }

    /**
     * Internal helper to apply rotation to a specific bone using slerp.
     */
    private applyRotation(boneName: string, rotation: Vector3, delta: number): void {
        const bone = this.bones.get(boneName);
        if (bone) {
            // Use scratch variables
            BoneController._euler.set(rotation[0], rotation[1], rotation[2]);
            BoneController._quaternion.setFromEuler(BoneController._euler);

            // Smoothly interpolate to the target rotation
            // Use Math.min(1, ...) to prevent overshooting if delta is large
            bone.quaternion.slerp(BoneController._quaternion, Math.min(1, delta * this.lerpSpeed));
        }
    }

    /**
     * Sets the interpolation speed for pose transitions.
     * @param speed Speed value (default: 10).
     */
    setLerpSpeed(speed: number): void {
        this.lerpSpeed = speed;
    }
}
