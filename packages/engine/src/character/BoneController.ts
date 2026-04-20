import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * Maps BodyPose properties to standard humanoid bone names.
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
 * BoneController — Manages skeletal posing by mapping BodyPose to bone rotations.
 * Supports smooth interpolation (slerp) between poses.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetQuaternions: Map<string, THREE.Quaternion> = new Map()
  private currentQuaternions: Map<string, THREE.Quaternion> = new Map()
  private lerpSpeed: number = 10.0 // higher is faster

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones

    // Initialize current quaternions from existing bone rotations
    for (const key of Object.keys(BONE_MAP) as Array<keyof BodyPose>) {
      const boneName = BONE_MAP[key]
      const bone = this.bones.get(boneName)
      if (bone) {
        this.currentQuaternions.set(key, bone.quaternion.clone())
        this.targetQuaternions.set(key, bone.quaternion.clone())
      }
    }
  }

  /**
   * Sets the target pose for the character.
   * Rotations in BodyPose are expected to be Euler angles in radians [x, y, z].
   */
  setPose(pose: BodyPose): void {
    for (const [key, rotation] of Object.entries(pose)) {
      if (!rotation) continue

      const boneName = BONE_MAP[key as keyof BodyPose]
      if (!boneName || !this.bones.has(boneName)) continue

      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotation[0], rotation[1], rotation[2])
      )
      this.targetQuaternions.set(key, targetQuat)
    }
  }

  /**
   * Update bone rotations with smooth interpolation.
   * Call this every frame.
   */
  update(delta: number): void {
    const step = this.lerpSpeed * delta

    for (const [key, target] of this.targetQuaternions.entries()) {
      const boneName = BONE_MAP[key as keyof BodyPose]
      const bone = this.bones.get(boneName)
      const current = this.currentQuaternions.get(key)

      if (!bone || !current) continue

      // Slerp current towards target
      current.slerp(target, Math.min(step, 1.0))

      // Apply to bone
      bone.quaternion.copy(current)
    }
  }

  /**
   * Immediately snap to the target pose without interpolation.
   */
  snapToPose(pose: BodyPose): void {
    this.setPose(pose)
    for (const [key, target] of this.targetQuaternions.entries()) {
      const boneName = BONE_MAP[key as keyof BodyPose]
      const bone = this.bones.get(boneName)
      const current = this.currentQuaternions.get(key)

      if (bone && current) {
        current.copy(target)
        bone.quaternion.copy(target)
      }
    }
  }

  /**
   * Reset all controlled bones to their default (identity) rotation.
   */
  reset(): void {
    const identity = new THREE.Quaternion()
    for (const key of Object.keys(BONE_MAP) as Array<keyof BodyPose>) {
      const boneName = BONE_MAP[key]
      const bone = this.bones.get(boneName)
      const current = this.currentQuaternions.get(key)
      const target = this.targetQuaternions.get(key)

      if (bone && current && target) {
        current.copy(identity)
        target.copy(identity)
        bone.quaternion.copy(identity)
      }
    }
  }
}
