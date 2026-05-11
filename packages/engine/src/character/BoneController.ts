/**
 * BoneController — Maps abstract BodyPose properties to Three.js humanoid bones.
 * Handles rotation application in radians.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * Controller for managing individual bone rotations on a character rig.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Apply a BodyPose to the character skeleton.
     * Maps abstract pose fields to standard bone names.
     */
    applyPose(pose: BodyPose): void {
        if (!pose) return

        this.setBoneRotation('Head', pose.head)
        this.setBoneRotation('Spine', pose.spine)
        this.setBoneRotation('LeftArm', pose.leftArm)
        this.setBoneRotation('RightArm', pose.rightArm)
        this.setBoneRotation('LeftUpperLeg', pose.leftLeg)
        this.setBoneRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Internal helper to set rotation on a named bone if it exists.
     */
    private setBoneRotation(name: string, rotation?: [number, number, number]): void {
        if (!rotation) return

        const bone = this.bones.get(name)
        if (bone) {
            bone.rotation.set(rotation[0], rotation[1], rotation[2])
        }
    }
}
