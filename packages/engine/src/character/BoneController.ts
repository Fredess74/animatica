import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Maps abstract BodyPose to THREE.Bone rotations.
 * Handles standard humanoid bone naming conventions.
 *
 * @module @animatica/engine/character/BoneController
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>

  /**
   * @param bones Map of bone names to THREE.Bone objects.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Set the pose of the character skeleton by applying rotations to bones.
   * Rotations are expected in radians as [x, y, z].
   *
   * @param pose BodyPose object containing rotation vectors for specific parts.
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
   * Apply rotation to a single bone if it exists in the map.
   */
  private applyRotation(boneName: string, rotation: [number, number, number]): void {
    const bone = this.bones.get(boneName)
    if (bone) {
      bone.rotation.set(rotation[0], rotation[1], rotation[2])
    }
  }

  /**
   * Reset all controlled bones to zero rotation.
   */
  reset(): void {
    const controlledBones = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
    controlledBones.forEach(name => {
      const bone = this.bones.get(name)
      if (bone) {
        bone.rotation.set(0, 0, 0)
      }
    })
  }
}
