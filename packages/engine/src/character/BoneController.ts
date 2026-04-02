/**
 * BoneController — Maps BodyPose data to Three.js bone rotations.
 * Provides manual bone overrides on top of skeletal animation.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * Maps BodyPose property names to standard humanoid bone names.
 */
const BONE_MAPPING: Record<keyof BodyPose, string> = {
  head: 'Head',
  spine: 'Spine',
  leftArm: 'LeftArm',
  rightArm: 'RightArm',
  leftLeg: 'LeftUpperLeg',
  rightLeg: 'RightUpperLeg',
}

/**
 * Controller for manually overriding bone rotations from BodyPose data.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private scratchEuler = new THREE.Euler()
  private scratchQuaternion = new THREE.Quaternion()
  private targetQuaternions = new Map<string, THREE.Quaternion>()
  private smoothing: number = 0.1 // interpolation factor (0-1)

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update the controller with new body pose data.
   * Calculates target quaternions for each posed bone.
   */
  updatePose(pose: BodyPose): void {
    // Collect active bone names from the new pose
    const activeBones = new Set<string>()

    for (const [key, value] of Object.entries(pose)) {
      const boneName = BONE_MAPPING[key as keyof BodyPose]
      if (!boneName || !value) continue

      activeBones.add(boneName)
      const rotation = value as Vector3
      const targetQuat = this.targetQuaternions.get(boneName) || new THREE.Quaternion()

      // Convert degrees to radians if necessary? types/index.ts says "Euler angles in radians"
      this.scratchEuler.set(rotation[0], rotation[1], rotation[2])
      targetQuat.setFromEuler(this.scratchEuler)
      this.targetQuaternions.set(boneName, targetQuat)
    }

    // Remove quaternions for bones no longer in the pose
    this.targetQuaternions.forEach((_, boneName) => {
      if (!activeBones.has(boneName)) {
        this.targetQuaternions.delete(boneName)
      }
    })
  }

  /**
   * Apply the pose overrides to the skeleton.
   * Should be called every frame AFTER the AnimationMixer update.
   */
  apply(delta: number): void {
    // If delta is 0, we shouldn't advance the interpolation
    if (delta <= 0) return

    // Frame-rate independent exponential smoothing: 1 - f^t
    // Here we use a simpler linear approximation for the smoothing factor per frame
    const lerpFactor = Math.min(1, this.smoothing * (delta / (1 / 60)))

    this.targetQuaternions.forEach((targetQuat, boneName) => {
      const bone = this.bones.get(boneName)
      if (!bone) return

      // Slerp from current animation pose to target override
      bone.quaternion.slerp(targetQuat, lerpFactor)
    })
  }

  /**
   * Set the smoothing factor for bone transitions.
   * @param value Factor between 0 (no movement) and 1 (instant).
   */
  setSmoothing(value: number): void {
    this.smoothing = Math.max(0, Math.min(1, value))
  }

  /**
   * Clear all pose overrides.
   */
  reset(): void {
    this.targetQuaternions.clear()
  }
}
