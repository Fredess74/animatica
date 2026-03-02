import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Maps abstract BodyPose data to Three.js skeleton bones.
 * Handles smoothing/slerping for frame-rate independent rotation transitions.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>
    private smoothing: number = 10.0 // higher = faster

    // Static temporary objects to minimize GC
    private static tempEuler = new THREE.Euler()
    private static tempQuat = new THREE.Quaternion()

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Apply a BodyPose to the character bones.
     * Should be called every frame in the update loop.
     *
     * @param pose The body pose rotations to apply
     * @param delta Frame delta time in seconds
     */
    update(pose: BodyPose, delta: number): void {
        if (pose.head) this.applyRotation('Head', pose.head, delta)
        if (pose.spine) this.applyRotation('Spine', pose.spine, delta)
        if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm, delta)
        if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm, delta)
        if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg, delta)
        if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg, delta)
    }

    /**
     * Smoothly apply rotation to a specific bone.
     */
    private applyRotation(boneName: string, rotation: Vector3, delta: number): void {
        const bone = this.bones.get(boneName)
        if (!bone) return

        // Convert Euler [x, y, z] to Quaternion
        BoneController.tempEuler.set(rotation[0], rotation[1], rotation[2])
        BoneController.tempQuat.setFromEuler(BoneController.tempEuler)

        // Slerp current bone rotation towards target
        const t = Math.min(delta * this.smoothing, 1.0)
        bone.quaternion.slerp(BoneController.tempQuat, t)
    }

    /**
     * Set the smoothing speed (higher = snappier).
     */
    setSmoothing(value: number): void {
        this.smoothing = value
    }
}
