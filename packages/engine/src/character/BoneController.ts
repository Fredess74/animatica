import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Maps abstract BodyPose data to actual 3D bone rotations.
 *
 * This controller allows overriding the procedurally generated or GLB animations
 * with specific poses for the head, spine, limbs, etc.
 *
 * @module @animatica/engine/character
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Update bone rotations based on the provided BodyPose.
     * Rotations are applied as Euler angles (radians).
     *
     * @param pose The body pose to apply.
     */
    updatePose(pose?: BodyPose): void {
        if (!pose) return

        if (pose.head) this.setBoneRotation('Head', pose.head)
        if (pose.spine) this.setBoneRotation('Spine', pose.spine)
        if (pose.leftArm) this.setBoneRotation('LeftArm', pose.leftArm)
        if (pose.rightArm) this.setBoneRotation('RightArm', pose.rightArm)
        if (pose.leftLeg) this.setBoneRotation('LeftUpperLeg', pose.leftLeg)
        if (pose.rightLeg) this.setBoneRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Helper to set rotation for a named bone.
     */
    private setBoneRotation(name: string, rotation: [number, number, number]): void {
        const bone = this.bones.get(name)
        if (bone) {
            bone.rotation.set(...rotation)
        }
    }
}
