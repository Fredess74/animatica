import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Maps abstract BodyPose to skeleton bone rotations.
 * Uses frame-rate independent exponential decay for smooth posing.
 *
 * Optimized with static scratch variables to eliminate object churn.
 */
export class BoneController {
    // Static scratch variables to eliminate object churn
    private static readonly SCRATCH_EULER = new THREE.Euler()
    private static readonly SCRATCH_QUAT = new THREE.Quaternion()

    private bones: Map<string, THREE.Bone>
    private targetPose: BodyPose = {}
    private lerpSpeed: number = 15.0

    /**
     * Bone mapping table: BodyPose key -> Rig Bone Name
     */
    private static readonly BONE_MAP: Record<keyof BodyPose, string> = {
        head: 'Head',
        spine: 'Spine',
        leftArm: 'LeftArm',
        rightArm: 'RightArm',
        leftLeg: 'LeftUpperLeg',
        rightLeg: 'RightUpperLeg',
    }

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Set the target pose to interpolate towards.
     */
    setPose(pose: BodyPose): void {
        this.targetPose = { ...pose }
    }

    /**
     * Set interpolation speed.
     */
    setSpeed(speed: number): void {
        this.lerpSpeed = speed
    }

    /**
     * Update bone rotations. Call this every frame after the animator update.
     */
    update(delta: number): void {
        const alpha = 1 - Math.exp(-this.lerpSpeed * delta)

        for (const [poseKey, boneName] of Object.entries(BoneController.BONE_MAP)) {
            const rotation = this.targetPose[poseKey as keyof BodyPose]
            if (!rotation) continue

            const bone = this.bones.get(boneName)
            if (!bone) continue

            // Convert Euler [x, y, z] to Quaternion
            BoneController.SCRATCH_EULER.set(rotation[0], rotation[1], rotation[2])
            BoneController.SCRATCH_QUAT.setFromEuler(BoneController.SCRATCH_EULER)

            // Slerp current bone rotation towards target
            bone.quaternion.slerp(BoneController.SCRATCH_QUAT, alpha)
        }
    }
}
