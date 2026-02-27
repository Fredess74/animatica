import * as THREE from 'three';
import type { BodyPose } from '../types';

/**
 * BoneController — Maps abstract BodyPose values to Three.js bones.
 * Supports manual rotation overrides for standard humanoid bones.
 * @module @animatica/engine/character
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>;

    /**
     * Create a new BoneController.
     * @param bones Map of bone names to THREE.Bone objects.
     */
    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones;
    }

    /**
     * Apply body pose rotations to bones.
     * Rotations are applied as Euler angles in radians [x, y, z].
     * @param pose The body pose configuration to apply.
     */
    update(pose: BodyPose): void {
        if (!pose) return;

        // Map BodyPose properties to standard humanoid bone names
        this.applyRotation('Head', pose.head);
        this.applyRotation('Spine', pose.spine);
        this.applyRotation('LeftArm', pose.leftArm);
        this.applyRotation('RightArm', pose.rightArm);
        this.applyRotation('LeftUpperLeg', pose.leftLeg);
        this.applyRotation('RightUpperLeg', pose.rightLeg);
    }

    /**
     * Helper to apply rotation to a specific bone if it exists.
     * @param boneName The name of the bone to rotate.
     * @param rotation The [x, y, z] rotation in radians.
     */
    private applyRotation(boneName: string, rotation?: [number, number, number]): void {
        if (!rotation) return;

        const bone = this.bones.get(boneName);
        if (bone) {
            // We use Euler rotation as defined in the Transform interface
            bone.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
    }

    /**
     * Get a bone by name.
     * @param name The bone name.
     * @returns The THREE.Bone if found, otherwise undefined.
     */
    getBone(name: string): THREE.Bone | undefined {
        return this.bones.get(name);
    }
}
