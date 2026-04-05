/**
 * BoneController — Manages skeletal bone overrides for manual posing.
 * Maps BodyPose data to bone rotations with smooth interpolation.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * Controller for overriding skeletal animations with manual pose data.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>
    private targetQuaternions: Map<string, THREE.Quaternion> = new Map()
    private lerpFactor: number = 0.15 // Base lerp speed

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Update the target pose from a BodyPose object.
     * Converts Euler rotations (Vector3) to Quaternions.
     */
    updatePose(pose?: BodyPose): void {
        if (!pose) {
            this.targetQuaternions.clear()
            return
        }

        // Reset targets if pose is empty or parts are missing
        const poseKeys = Object.keys(pose) as (keyof BodyPose)[]

        // Remove target quaternions for bones no longer in the pose
        for (const boneName of this.targetQuaternions.keys()) {
            const poseKey = this.mapBoneNameToPoseKey(boneName)
            if (!poseKey || !pose[poseKey]) {
                this.targetQuaternions.delete(boneName)
            }
        }

        // Set new targets
        poseKeys.forEach((key) => {
            const rotation = pose[key]
            if (!rotation) return

            const boneName = this.mapPoseKeyToBoneName(key)
            if (!boneName) return

            const bone = this.bones.get(boneName)
            if (bone) {
                const target = new THREE.Quaternion().setFromEuler(
                    new THREE.Euler(rotation[0], rotation[1], rotation[2])
                )
                this.targetQuaternions.set(boneName, target)
            }
        })
    }

    /**
     * Update bone rotations (call every frame).
     * Smoothly lerps towards target quaternions using delta time.
     */
    update(delta: number): void {
        const factor = Math.min(delta * 60 * this.lerpFactor, 1.0)

        this.targetQuaternions.forEach((target, boneName) => {
            const bone = this.bones.get(boneName)
            if (bone) {
                bone.quaternion.slerp(target, factor)
            }
        })
    }

    /**
     * Maps BodyPose keys to actual bone names in the rig.
     */
    private mapPoseKeyToBoneName(key: keyof BodyPose): string | null {
        switch (key) {
            case 'head': return 'Head'
            case 'spine': return 'Spine'
            case 'leftArm': return 'LeftArm'
            case 'rightArm': return 'RightArm'
            case 'leftLeg': return 'LeftUpperLeg'
            case 'rightLeg': return 'RightUpperLeg'
            default: return null
        }
    }

    /**
     * Reverse map for cleanup.
     */
    private mapBoneNameToPoseKey(boneName: string): keyof BodyPose | null {
        switch (boneName) {
            case 'Head': return 'head'
            case 'Spine': return 'spine'
            case 'LeftArm': return 'leftArm'
            case 'RightArm': return 'rightArm'
            case 'LeftUpperLeg': return 'leftLeg'
            case 'RightUpperLeg': return 'rightLeg'
            default: return null
        }
    }
}
