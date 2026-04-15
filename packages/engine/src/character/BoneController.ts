import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Manages skeletal posing by mapping BodyPose properties to Three.js bones.
 * It provides a way to override or layer manual bone rotations on top of animations.
 *
 * @module @animatica/engine/character
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>
    private scratchEuler = new THREE.Euler()

    /**
     * @param bones Map of bone names to THREE.Bone objects (usually from CharacterRig)
     */
    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones
    }

    /**
     * Applies a BodyPose to the skeleton.
     * Rotations are applied in Euler angles (radians) using the 'XYZ' order.
     *
     * @param pose The body pose to apply
     */
    public setPose(pose: BodyPose): void {
        if (!pose) return

        this.applyRotation('Head', pose.head)
        this.applyRotation('Spine', pose.spine)
        this.applyRotation('LeftArm', pose.leftArm)
        this.applyRotation('RightArm', pose.rightArm)
        this.applyRotation('LeftUpperLeg', pose.leftLeg)
        this.applyRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Internal helper to apply rotation to a specific bone if it exists.
     */
    private applyRotation(boneName: string, rotation?: Vector3): void {
        if (!rotation) return

        const bone = this.bones.get(boneName)
        if (bone) {
            // We use XYZ order as standard for our Euler rotations
            this.scratchEuler.set(rotation[0], rotation[1], rotation[2], 'XYZ')
            bone.quaternion.setFromEuler(this.scratchEuler)
        }
    }

    /**
     * Resets all managed bones to their identity rotation (0,0,0).
     */
    public reset(): void {
        const bonesToReset = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
        bonesToReset.forEach(name => {
            const bone = this.bones.get(name)
            if (bone) {
                bone.quaternion.identity()
            }
        })
    }
}
