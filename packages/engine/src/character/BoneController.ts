import * as THREE from 'three'
import { BodyPose } from '../types'

/**
 * BoneController — Maps a BodyPose object to Three.js bone rotations.
 *
 * Maps abstract pose properties to standard humanoid bone names:
 * - head    -> 'Head'
 * - spine   -> 'Spine'
 * - leftArm -> 'LeftArm'
 * - rightArm-> 'RightArm'
 * - leftLeg -> 'LeftUpperLeg'
 * - rightLeg-> 'RightUpperLeg'
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Applies the given pose to the character's skeleton.
     * @param pose The BodyPose object containing rotation overrides.
     */
    update(pose: BodyPose): void {
        if (!pose) return

        this.applyBoneRotation('Head', pose.head)
        this.applyBoneRotation('Spine', pose.spine)
        this.applyBoneRotation('LeftArm', pose.leftArm)
        this.applyBoneRotation('RightArm', pose.rightArm)
        this.applyBoneRotation('LeftUpperLeg', pose.leftLeg)
        this.applyBoneRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Helper to apply a rotation to a specific bone if it exists.
     */
    private applyBoneRotation(boneName: string, rotation?: [number, number, number]): void {
        if (!rotation) return

        const bone = this.bones.get(boneName)
        if (bone) {
            bone.rotation.set(rotation[0], rotation[1], rotation[2])
        }
    }
}
