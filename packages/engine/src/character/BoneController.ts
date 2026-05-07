import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

/**
 * Maps BodyPose properties to actual humanoid bone names.
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
 * BoneController — Handles manual character posing via BodyPose data.
 * Applies smooth interpolation to bone rotations for frame-rate independence.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targets: Map<string, THREE.Quaternion> = new Map()
  private speed: number = 10.0

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update the target pose. Values will be interpolated in the next update() calls.
   */
  setPose(pose: BodyPose): void {
    for (const [key, boneName] of Object.entries(BONE_MAP)) {
      const rotation = pose[key as keyof BodyPose] as Vector3 | undefined
      if (rotation) {
        const quat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(rotation[0], rotation[1], rotation[2])
        )
        this.targets.set(boneName, quat)
      }
    }
  }

  /**
   * Set interpolation speed.
   */
  setSpeed(speed: number): void {
    this.speed = speed
  }

  /**
   * Apply interpolation to bones. Call this every frame.
   */
  update(delta: number): void {
    if (delta <= 0) return

    const alpha = 1 - Math.exp(-this.speed * delta)

    this.targets.forEach((targetQuat, boneName) => {
      const bone = this.bones.get(boneName)
      if (bone) {
        bone.quaternion.slerp(targetQuat, alpha)
      }
    })
  }

  /**
   * Immediately snap bones to the target pose.
   */
  snapToPose(pose: BodyPose): void {
    this.setPose(pose)
    this.targets.forEach((targetQuat, boneName) => {
      const bone = this.bones.get(boneName)
      if (bone) {
        bone.quaternion.copy(targetQuat)
      }
    })
  }

  /**
   * Reset all bones in the controller to their default (identity) rotation.
   */
  reset(): void {
    this.targets.clear()
    Object.values(BONE_MAP).forEach((boneName) => {
      const bone = this.bones.get(boneName)
      if (bone) {
        bone.quaternion.set(0, 0, 0, 1)
      }
    })
  }
}
