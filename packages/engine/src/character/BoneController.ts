/**
 * BoneController — Maps abstract BodyPose data to actual skeleton bone rotations.
 * This allows for procedural posing on top of or instead of animations.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * Standard bone names that are controlled by procedural posing.
 */
const CONTROLLED_BONES = [
  'Head',
  'Spine',
  'LeftArm',
  'RightArm',
  'LeftUpperLeg',
  'RightUpperLeg',
] as const

/**
 * Controller for applying pose rotations to specific bones in a humanoid skeleton.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private scratchEuler = new THREE.Euler()

  /**
   * @param bones Map of bone names to THREE.Bone objects.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update bone rotations based on the provided pose.
   * Rotations are applied as Euler angles in radians.
   *
   * @param pose The body pose to apply.
   */
  update(pose: BodyPose): void {
    if (pose.head) this.applyRotation('Head', pose.head)
    if (pose.spine) this.applyRotation('Spine', pose.spine)
    if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm)
    if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm)
    if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg)
    if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg)
  }

  /**
   * Apply a rotation vector to a specific bone.
   * @param boneName The name of the bone to rotate.
   * @param rotation The [x, y, z] rotation in radians.
   */
  private applyRotation(boneName: string, rotation: [number, number, number]): void {
    const bone = this.bones.get(boneName)
    if (bone) {
      this.scratchEuler.set(rotation[0], rotation[1], rotation[2])
      bone.quaternion.setFromEuler(this.scratchEuler)
    }
  }

  /**
   * Reset all controlled bones to their default (zero) rotation.
   */
  reset(): void {
    CONTROLLED_BONES.forEach((name) => {
      const bone = this.bones.get(name)
      if (bone) {
        bone.quaternion.set(0, 0, 0, 1)
      }
    })
  }
}
