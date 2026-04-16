import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Manages skeletal posing by mapping abstract BodyPose properties
 * to actual Three.js bones.
 *
 * Performance Note: Uses static scratch variables to avoid per-frame GC pressure.
 */
export class BoneController {
  private static readonly SCRATCH_EULER = new THREE.Euler()

  private bones: Map<string, THREE.Bone>

  /**
   * @param bones Map of bone names to THREE.Bone objects (from CharacterRig).
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update the skeletal pose based on the provided BodyPose configuration.
   * This should be called within the useFrame loop after AnimationMixer.update().
   *
   * @param pose The body pose to apply.
   */
  update(pose: BodyPose): void {
    if (!pose) return

    if (pose.head) this.applyRotation('Head', pose.head)
    if (pose.spine) this.applyRotation('Spine', pose.spine)
    if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm)
    if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm)
    if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg)
    if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg)
  }

  /**
   * Apply a [x, y, z] rotation to a specific bone.
   */
  private applyRotation(boneName: string, rotation: [number, number, number]): void {
    const bone = this.bones.get(boneName)
    if (bone) {
      BoneController.SCRATCH_EULER.set(rotation[0], rotation[1], rotation[2])
      bone.quaternion.setFromEuler(BoneController.SCRATCH_EULER)
    }
  }
}
