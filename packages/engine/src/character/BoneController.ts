/**
 * BoneController — Maps the abstract BodyPose data model to actual skeleton bone rotations.
 * Provides smooth interpolation for fluid movement.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * Maps BodyPose keys to humanoid bone names.
 */
const POSE_BONE_MAP: Record<keyof BodyPose, string> = {
  head: 'Head',
  spine: 'Spine',
  leftArm: 'LeftArm',
  rightArm: 'RightArm',
  leftLeg: 'LeftUpperLeg',
  rightLeg: 'RightUpperLeg',
}

export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetQuaternions: Map<string, THREE.Quaternion> = new Map()
  private smoothing: number = 10.0 // Higher = faster reaction

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update bone rotations based on the current body pose.
   * Performs smooth interpolation towards the target rotations.
   *
   * @param pose The target BodyPose configuration.
   * @param delta Frame delta time in seconds.
   */
  update(pose: BodyPose, delta: number): void {
    if (!pose) return

    // Calculate target rotations from Vector3 (Euler radians)
    Object.entries(POSE_BONE_MAP).forEach(([poseKey, boneName]) => {
      const rotation = pose[poseKey as keyof BodyPose]
      const bone = this.bones.get(boneName)

      if (rotation && bone) {
        let targetQuat = this.targetQuaternions.get(boneName)
        if (!targetQuat) {
          targetQuat = new THREE.Quaternion()
          this.targetQuaternions.set(boneName, targetQuat)
        }

        // Create Euler from [x, y, z] and convert to Quaternion
        const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2])
        targetQuat.setFromEuler(euler)

        // Smoothly slerp bone rotation towards target
        // lerp factor = 1 - exp(-smoothing * delta)
        const alpha = 1.0 - Math.exp(-this.smoothing * delta)
        bone.quaternion.slerp(targetQuat, Math.min(alpha, 1.0))
      }
    })
  }

  /**
   * Set the smoothing factor (reactivity).
   * @param value Reactivity value (default 10).
   */
  setSmoothing(value: number): void {
    this.smoothing = value
  }
}
