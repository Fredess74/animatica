import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'
import type { CharacterRig } from './CharacterLoader'

/**
 * BoneController — Manages skeletal posing for character actors.
 * Maps the high-level BodyPose interface to specific Three.js bones.
 *
 * Supports:
 * - Direct rotation application from BodyPose
 * - Graceful handling of missing bones
 * - Resetting to default bind pose
 *
 * @module @animatica/engine/character
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>

    constructor(rig: CharacterRig) {
        this.bones = rig.bones
    }

    /**
     * Applies a BodyPose to the character's skeleton.
     * Rotations are expected to be Euler angles in radians.
     *
     * @param pose The body pose to apply.
     */
    setPose(pose: BodyPose): void {
        if (pose.head) this.applyRotation('Head', pose.head)
        if (pose.spine) this.applyRotation('Spine', pose.spine)
        if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm)
        if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm)
        if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg)
        if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Resets all pose-controllable bones to identity rotation.
     */
    reset(): void {
        const poseBones = [
            'Head',
            'Spine',
            'LeftArm',
            'RightArm',
            'LeftUpperLeg',
            'RightUpperLeg',
        ]

        poseBones.forEach((name) => {
            const bone = this.bones.get(name)
            if (bone) {
                bone.quaternion.set(0, 0, 0, 1)
            }
        })
    }

    /**
     * Internal helper to apply rotation to a named bone.
     */
    private applyRotation(boneName: string, rotation: Vector3): void {
        const bone = this.bones.get(boneName)
        if (bone) {
            // BodyPose uses [x, y, z] Euler angles
            bone.rotation.set(rotation[0], rotation[1], rotation[2])
        }
    }
}
