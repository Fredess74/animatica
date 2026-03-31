import * as THREE from 'three'
import type { BodyPose } from '../types'

// Performance: use static scratch variables in the update loop to prevent GC jitter
const SCRATCH_EULER = new THREE.Euler()
const SCRATCH_QUAT = new THREE.Quaternion()

/**
 * BoneController — Maps BodyPose properties to standard humanoid bones.
 * Implements frame-rate independent rotation smoothing using THREE.Quaternion.slerp.
 *
 * Mapping:
 * - head -> Head
 * - spine -> Spine
 * - leftArm -> LeftArm
 * - rightArm -> RightArm
 * - leftLeg -> LeftUpperLeg
 * - rightLeg -> RightUpperLeg
 */
/**
 * Standard humanoid bones controlled by the BoneController.
 */
const CONTROLLED_BONES = [
  'Head',
  'Spine',
  'LeftArm',
  'RightArm',
  'LeftUpperLeg',
  'RightUpperLeg',
] as const

export class BoneController {
  private bones: Map<string, THREE.Bone>
  private smoothingAlpha = 0.15 // Default smoothing alpha

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update bone rotations based on the current BodyPose and time delta.
   * Applies frame-rate independent smoothing: 1 - (1 - alpha)^(delta * 60)
   *
   * @param pose The BodyPose object containing rotation overrides
   * @param delta The time delta since the last frame in seconds
   */
  update(pose: BodyPose, delta: number): void {
    // Frame-rate independent alpha
    const alpha = 1 - Math.pow(1 - this.smoothingAlpha, delta * 60)

    // Map Pose Fields to Three.js Bones
    this.applyBoneRotation('Head', pose.head, alpha)
    this.applyBoneRotation('Spine', pose.spine, alpha)
    this.applyBoneRotation('LeftArm', pose.leftArm, alpha)
    this.applyBoneRotation('RightArm', pose.rightArm, alpha)
    this.applyBoneRotation('LeftUpperLeg', pose.leftLeg, alpha)
    this.applyBoneRotation('RightUpperLeg', pose.rightLeg, alpha)
  }

  /**
   * Internal helper to apply rotation to a specific bone.
   */
  private applyBoneRotation(
    boneName: string,
    rotation: [number, number, number] | undefined,
    alpha: number
  ): void {
    if (!rotation) return

    const bone = this.bones.get(boneName)
    if (!bone) return

    // Set target rotation from pose (Euler radians)
    SCRATCH_EULER.set(rotation[0], rotation[1], rotation[2])
    SCRATCH_QUAT.setFromEuler(SCRATCH_EULER)

    // Slerp current rotation to target rotation for smooth movement
    bone.quaternion.slerp(SCRATCH_QUAT, alpha)
  }

  /**
   * Sets the smoothing factor (0.01 to 1.0).
   * Lower values are smoother/slower, higher values are snappier.
   */
  setSmoothing(alpha: number): void {
    this.smoothingAlpha = THREE.MathUtils.clamp(alpha, 0.01, 1.0)
  }

  /**
   * Resets all controlled bones to their default (neutral) identity rotation.
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
