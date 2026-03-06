import * as THREE from 'three'
import type { BodyPose } from '../types'
import type { CharacterRig } from './CharacterLoader'

/**
 * BoneController — Manages manual skeletal overrides (BodyPose).
 * Applies rotations from BodyPose to specific bones with smooth interpolation.
 *
 * @module @animatica/engine/character
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>
    private targetPose: BodyPose = {}
    private lerpSpeed: number = 10.0 // Units per second for smooth posing

    // Reuse objects to avoid allocation in frame loop
    private tempEuler = new THREE.Euler()
    private tempQuat = new THREE.Quaternion()

    /**
     * Map BodyPose field names to rig bone names.
     */
    private static BONE_MAP: Record<keyof BodyPose, string> = {
        head: 'Head',
        spine: 'Spine',
        leftArm: 'LeftArm',
        rightArm: 'RightArm',
        leftLeg: 'LeftUpperLeg',
        rightLeg: 'RightUpperLeg',
    }

    constructor(rig: CharacterRig) {
        this.bones = rig.bones
    }

    /**
     * Set the target body pose to interpolate towards.
     * @param pose Partial or full BodyPose object.
     */
    setPose(pose: BodyPose): void {
        this.targetPose = { ...pose }
    }

    /**
     * Update bone rotations. Call this in the frame loop AFTER CharacterAnimator.update().
     * @param delta Time since last frame in seconds.
     */
    update(delta: number): void {
        const step = Math.min(delta * this.lerpSpeed, 1.0)

        for (const key of Object.keys(BoneController.BONE_MAP) as Array<keyof BodyPose>) {
            const targetRot = this.targetPose[key]
            if (!targetRot) continue

            const boneName = BoneController.BONE_MAP[key]
            const bone = this.bones.get(boneName)
            if (!bone) continue

            // Convert Euler [x,y,z] in radians to Quaternion
            this.tempEuler.set(targetRot[0], targetRot[1], targetRot[2])
            this.tempQuat.setFromEuler(this.tempEuler)

            // Interpolate current bone rotation (potentially from animation) towards manual target
            bone.quaternion.slerp(this.tempQuat, step)
        }
    }

    /**
     * Set the interpolation speed.
     * @param speed Higher values make posing snappier.
     */
    setSpeed(speed: number): void {
        this.lerpSpeed = speed
    }

    /**
     * Reset all manual bone overrides and return to neutral (or animation-driven) pose.
     */
    reset(): void {
        this.targetPose = {}
    }
}
