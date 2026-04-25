/**
 * BoneController — Maps abstract BodyPose data to character skeleton bones.
 * Supports smooth interpolation (slerp) between poses.
 */
import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

/**
 * Controller for applying custom rotations to character bones.
 * Used for manual posing on top of or instead of animations.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetPose: BodyPose = {}
  private lerpSpeed: number = 8.0 // Speed of interpolation (higher = faster)

  /**
   * @param bones Map of bone names to THREE.Bone instances.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Set a new target pose for the character.
   * @param pose The desired body pose rotations.
   */
  setTargetPose(pose: BodyPose): void {
    this.targetPose = { ...pose }
  }

  /**
   * Update bone rotations. Call this every frame.
   * @param delta Time since last frame in seconds.
   */
  update(delta: number): void {
    const step = Math.min(delta * this.lerpSpeed, 1.0)

    // Map BodyPose fields to standard humanoid bones
    this.applyRotation('head', 'Head', step)
    this.applyRotation('spine', 'Spine', step)
    this.applyRotation('leftArm', 'LeftArm', step)
    this.applyRotation('rightArm', 'RightArm', step)
    this.applyRotation('leftLeg', 'LeftUpperLeg', step)
    this.applyRotation('rightLeg', 'RightUpperLeg', step)
  }

  /**
   * Internal helper to apply slerp rotation to a specific bone.
   */
  private applyRotation(poseKey: keyof BodyPose, boneName: string, step: number): void {
    const rotation = this.targetPose[poseKey] as Vector3 | undefined
    const bone = this.bones.get(boneName)

    if (!bone) return

    // Create target quaternion from Euler angles (radians)
    const targetQuat = new THREE.Quaternion()
    if (rotation) {
      targetQuat.setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]))
    } else {
      // Default to identity rotation (neutral pose)
      targetQuat.set(0, 0, 0, 1)
    }

    // Smoothly interpolate to the target
    bone.quaternion.slerp(targetQuat, step)
  }

  /**
   * Set the interpolation speed.
   */
  setLerpSpeed(speed: number): void {
    this.lerpSpeed = speed
  }
}
