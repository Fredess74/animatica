/**
 * BoneController — Manages manual character posing by overriding bone rotations.
 * Uses exponential decay for smooth, frame-rate independent transitions.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

// Reusable scratch variables to avoid object churn
const tempEuler = new THREE.Euler()
const tempQuat = new THREE.Quaternion()

export class BoneController {
    private bones: Map<string, THREE.Bone>
    private speed: number = 12.0 // Smoothing factor (higher = faster)

    /**
     * @param bones Map of bone names to THREE.Bone instances.
     * @param speed Optional smoothing speed (default 12.0).
     */
    constructor(bones: Map<string, THREE.Bone>, speed?: number) {
        this.bones = bones
        if (speed !== undefined) this.speed = speed
    }

    /**
     * Update bone rotations based on the provided BodyPose.
     * Call this after the animation mixer update.
     *
     * @param pose The target body pose.
     * @param delta Time since last frame in seconds.
     */
    update(pose: BodyPose, delta: number): void {
        if (!pose) return

        // Exponential decay smoothing factor
        const alpha = 1 - Math.exp(-this.speed * delta)

        // Map BodyPose keys to standard humanoid bone names
        if (pose.head) this.applyRotation('Head', pose.head, alpha)
        if (pose.spine) this.applyRotation('Spine', pose.spine, alpha)
        if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm, alpha)
        if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm, alpha)
        if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg, alpha)
        if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg, alpha)
    }

    /**
     * Internal helper to apply smoothed rotation to a specific bone.
     */
    private applyRotation(boneName: string, rotation: Vector3, alpha: number): void {
        const bone = this.bones.get(boneName)
        if (!bone) return

        // Set target quaternion
        tempEuler.set(rotation[0], rotation[1], rotation[2])
        tempQuat.setFromEuler(tempEuler)

        // Smoothly interpolate from current rotation to target
        bone.quaternion.slerp(tempQuat, alpha)
    }

    /**
     * Set the smoothing speed.
     */
    setSpeed(speed: number): void {
        this.speed = speed
    }
}
