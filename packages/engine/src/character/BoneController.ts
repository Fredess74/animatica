import * as THREE from 'three'
import { BodyPose } from '../types'

/**
 * BoneController — Maps abstract BodyPose properties to specific skeleton bones.
 * Handles bone lookup and rotation application.
 *
 * Performance Note: Uses a static scratch Euler to avoid GC pressure.
 *
 * @module @animatica/engine/character
 */
export class BoneController {
    private static readonly scratchEuler = new THREE.Euler()
    private bones: Map<string, THREE.Bone>

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Update bone rotations based on the provided BodyPose.
     * @param pose The body pose overrides to apply.
     */
    update(pose?: BodyPose | null): void {
        if (!pose) return

        if (pose.head) this.applyRotation('Head', pose.head)
        if (pose.spine) this.applyRotation('Spine', pose.spine)
        if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm)
        if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm)
        if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg)
        if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Internal helper to apply a rotation vector [x, y, z] to a bone by name.
     */
    private applyRotation(boneName: string, rotation: [number, number, number]): void {
        const bone = this.bones.get(boneName)
        if (bone) {
            BoneController.scratchEuler.set(rotation[0], rotation[1], rotation[2])
            bone.rotation.copy(BoneController.scratchEuler)
        }
    }
}
