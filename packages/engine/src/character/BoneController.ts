import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Manages manual character posing by overriding bone rotations.
 * Applies rotations from BodyPose to a character's skeleton with smooth interpolation.
 *
 * @module @animatica/engine/character
 */

const tempEuler = new THREE.Euler()
const tempQuaternion = new THREE.Quaternion()

export class BoneController {
    private bones: Map<string, THREE.Bone>
    private lerpSpeed: number = 15.0 // Smoothness of the override

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Update bone rotations based on the provided pose.
     * Should be called every frame after the animator update to apply overrides.
     *
     * @param pose The manual body pose overrides
     * @param delta Frame delta time in seconds
     */
    update(pose: BodyPose | undefined, delta: number): void {
        if (!pose) return

        this.applyBoneRotation('Head', pose.head, delta)
        this.applyBoneRotation('Spine', pose.spine, delta)
        this.applyBoneRotation('LeftArm', pose.leftArm, delta)
        this.applyBoneRotation('RightArm', pose.rightArm, delta)
        this.applyBoneRotation('LeftUpperLeg', pose.leftLeg, delta)
        this.applyBoneRotation('RightUpperLeg', pose.rightLeg, delta)
    }

    /**
     * Apply rotation to a specific bone by name.
     */
    private applyBoneRotation(
        boneName: string,
        rotation: [number, number, number] | undefined,
        delta: number
    ): void {
        if (!rotation) return

        const bone = this.bones.get(boneName)
        if (!bone) return

        // Create target quaternion
        tempEuler.set(rotation[0], rotation[1], rotation[2])
        tempQuaternion.setFromEuler(tempEuler)

        // Interpolate current rotation towards target
        const step = this.lerpSpeed * delta
        bone.quaternion.slerp(tempQuaternion, Math.min(step, 1))
    }

    /**
     * Set the interpolation speed for smooth posing.
     */
    setLerpSpeed(speed: number): void {
        this.lerpSpeed = speed
    }
}
