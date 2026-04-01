import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Manages bone-level rotations for character body posing.
 * Allows overriding or layering custom poses on top of skeletal animation.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private scratchEuler: THREE.Euler = new THREE.Euler()

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update bone rotations based on the provided BodyPose.
   * This should be called after the animation mixer update to allow pose overrides.
   * @param pose The body pose object containing Euler rotations (radians).
   */
  update(pose: BodyPose): void {
    if (pose.head) {
      this.applyRotation('Head', pose.head)
    }
    if (pose.spine) {
      this.applyRotation('Spine', pose.spine)
    }
    if (pose.leftArm) {
      this.applyRotation('LeftArm', pose.leftArm)
    }
    if (pose.rightArm) {
      this.applyRotation('RightArm', pose.rightArm)
    }
    if (pose.leftLeg) {
      this.applyRotation('LeftUpperLeg', pose.leftLeg)
    }
    if (pose.rightLeg) {
      this.applyRotation('RightUpperLeg', pose.rightLeg)
    }
  }

  /**
   * Internal helper to apply Euler rotation to a specific bone.
   */
  private applyRotation(boneName: string, rotation: [number, number, number]): void {
    const bone = this.bones.get(boneName)
    if (bone) {
      this.scratchEuler.set(rotation[0], rotation[1], rotation[2])
      bone.quaternion.setFromEuler(this.scratchEuler)
    }
  }
}
