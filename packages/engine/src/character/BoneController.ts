import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Maps abstract BodyPose data to Three.js skeleton bones.
 * This class translates high-level pose parameters into specific bone rotations.
 */
export class BoneController {
  private boneMap: Map<string, THREE.Bone> = new Map()

  /**
   * Creates a new BoneController instance.
   * @param bones A map of bone names to THREE.Bone instances, typically from a CharacterRig.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.boneMap = bones
  }

  /**
   * Updates the bone rotations based on the provided BodyPose.
   * Only properties present in the pose object will be updated.
   * @param pose The body pose configuration to apply.
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
   * Resets all controlled bones to their default (zero) rotation.
   */
  reset(): void {
    const bonesToReset = [
      'Head',
      'Spine',
      'LeftArm',
      'RightArm',
      'LeftUpperLeg',
      'RightUpperLeg',
    ]

    bonesToReset.forEach((name) => {
      const bone = this.boneMap.get(name)
      if (bone) {
        bone.rotation.set(0, 0, 0)
      }
    })
  }

  /**
   * Internal helper to apply rotation to a specific bone by name.
   * @param boneName The name of the bone in the skeleton.
   * @param rotation The [x, y, z] Euler rotation in radians.
   */
  private applyRotation(boneName: string, rotation: Vector3): void {
    const bone = this.boneMap.get(boneName)
    if (bone) {
      bone.rotation.set(rotation[0], rotation[1], rotation[2])
    }
  }
}
