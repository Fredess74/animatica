/**
 * BoneController — Maps abstract BodyPose data to Three.js skeleton bones.
 * Handles smooth interpolation of bone rotations to prevent snapping.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * Mapping between BodyPose property names and humanoid bone names.
 */
const POSE_BONE_MAP: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
}

/**
 * BoneController — manages per-bone rotation overrides.
 * Applied after animation updates to allow for posing.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>
    private currentQuaternions: Map<string, THREE.Quaternion> = new Map()
    private targetQuaternions: Map<string, THREE.Quaternion> = new Map()
    private blendSpeed: number = 10.0 // rad/sec approx, or lerp factor

    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones

        // Initialize current quaternions from existing bone rotations
        for (const [prop, boneName] of Object.entries(POSE_BONE_MAP)) {
            const bone = this.bones.get(boneName)
            if (bone) {
                this.currentQuaternions.set(prop, bone.quaternion.clone())
                this.targetQuaternions.set(prop, bone.quaternion.clone())
            }
        }
    }

    /**
     * Set the target pose for the character.
     * Rotations in BodyPose are Euler angles in radians [x, y, z].
     */
    setPose(pose: BodyPose): void {
        for (const [prop, value] of Object.entries(pose)) {
            if (prop in POSE_BONE_MAP && value) {
                const euler = new THREE.Euler(...(value as Vector3))
                const target = new THREE.Quaternion().setFromEuler(euler)
                this.targetQuaternions.set(prop, target)
            }
        }
    }

    /**
     * Update the bone rotations (call every frame).
     * @param delta Time since last frame in seconds.
     */
    update(delta: number): void {
        const alpha = Math.min(delta * this.blendSpeed, 1.0)

        for (const [prop, boneName] of Object.entries(POSE_BONE_MAP)) {
            const bone = this.bones.get(boneName)
            const target = this.targetQuaternions.get(prop)
            const current = this.currentQuaternions.get(prop)

            if (bone && target && current) {
                // Smoothly interpolate current quaternion towards target
                current.slerp(target, alpha)

                // Apply to bone - note: this should be called AFTER animator.update()
                bone.quaternion.copy(current)
            }
        }
    }

    /**
     * Set a pose immediately without interpolation.
     */
    setImmediate(pose: BodyPose): void {
        this.setPose(pose)
        for (const [prop, target] of this.targetQuaternions.entries()) {
            this.currentQuaternions.set(prop, target.clone())

            const boneName = POSE_BONE_MAP[prop as keyof BodyPose]
            const bone = this.bones.get(boneName)
            if (bone) {
                bone.quaternion.copy(target)
            }
        }
    }

    /**
     * Reset all bone overrides to identity (neutral).
     */
    reset(): void {
        const identity = new THREE.Quaternion()
        for (const [prop, boneName] of Object.entries(POSE_BONE_MAP)) {
            this.targetQuaternions.set(prop, identity.clone())

            const bone = this.bones.get(boneName)
            if (bone) {
                bone.rotation.set(0, 0, 0)
                this.currentQuaternions.set(prop, bone.quaternion.clone())
            }
        }
    }
}
