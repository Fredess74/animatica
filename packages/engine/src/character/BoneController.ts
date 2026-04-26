/**
 * BoneController — Manages manual bone rotations (body posing) on a character.
 * Maps high-level BodyPose properties to specific humanoid bones.
 * Supports smooth interpolation (slerp) towards target poses.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * Maps BodyPose keys to standard humanoid bone names.
 */
const BONE_MAP: Record<keyof BodyPose, string> = {
  head: 'Head',
  spine: 'Spine',
  leftArm: 'LeftArm',
  rightArm: 'RightArm',
  leftLeg: 'LeftUpperLeg',
  rightLeg: 'RightUpperLeg',
}

/**
 * Controller for manual character posing.
 * Intersects with the animation system by applying overrides to specific bones.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetRotations: Map<string, THREE.Quaternion> = new Map()
  private blendSpeed: number = 8.0 // Speed of interpolation

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Sets the target pose for the character.
   * Converts Euler angles (radians) from BodyPose to Quaternions.
   *
   * @param pose The target body pose configuration.
   */
  setPose(pose: BodyPose): void {
    Object.entries(BONE_MAP).forEach(([key, boneName]) => {
      const rotation = pose[key as keyof BodyPose]
      if (rotation) {
        const q = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(rotation[0], rotation[1], rotation[2])
        )
        this.targetRotations.set(boneName, q)
      } else {
        this.targetRotations.delete(boneName)
      }
    })
  }

  /**
   * Updates the character's bones towards the target pose.
   * Call this in the frame loop AFTER the main animation update.
   *
   * @param delta Time since last frame in seconds.
   */
  update(delta: number): void {
    if (this.targetRotations.size === 0) return

    const alpha = Math.min(delta * this.blendSpeed, 1.0)

    this.targetRotations.forEach((target, boneName) => {
      const bone = this.bones.get(boneName)
      if (bone) {
        // Smoothly interpolate towards the target rotation
        bone.quaternion.slerp(target, alpha)
      }
    })
  }

  /**
   * Set the interpolation speed.
   * @param speed Units per second.
   */
  setBlendSpeed(speed: number): void {
    this.blendSpeed = speed
  }
}
