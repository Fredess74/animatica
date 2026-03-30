import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Maps BodyPose properties to Three.js bones and handles smooth interpolation.
 * Uses static scratch variables for performance to avoid GC pressure in the update loop.
 */
export class BoneController {
  private static readonly SCRATCH_EULER = new THREE.Euler()
  private static readonly SCRATCH_QUATERNION = new THREE.Quaternion()
  private static readonly TARGET_QUATERNION = new THREE.Quaternion()

  private bones: Map<string, THREE.Bone>
  private smoothing: number = 0.15 // Default smoothing factor

  /**
   * @param bones Map of bone names to THREE.Bone instances.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Sets the smoothing factor for bone rotations.
   * @param value Smoothing factor (0-1), where 1 is immediate.
   */
  setSmoothing(value: number): void {
    this.smoothing = Math.max(0, Math.min(1, value))
  }

  /**
   * Updates bone rotations based on the provided BodyPose.
   * This should be called every frame after the animation mixer update.
   *
   * @param pose The target body pose.
   * @param delta Frame delta time in seconds.
   */
  update(pose: BodyPose, delta: number): void {
    if (!pose) return

    // Smoothing formula: 1 - (1 - alpha)^(delta * 60)
    // This makes the smoothing frame-rate independent.
    const alpha = 1 - Math.pow(1 - this.smoothing, delta * 60)

    this.applyBoneRotation('Head', pose.head, alpha)
    this.applyBoneRotation('Spine', pose.spine, alpha)
    this.applyBoneRotation('LeftArm', pose.leftArm, alpha)
    this.applyBoneRotation('RightArm', pose.rightArm, alpha)
    this.applyBoneRotation('LeftUpperLeg', pose.leftLeg, alpha)
    this.applyBoneRotation('RightUpperLeg', pose.rightLeg, alpha)
  }

  /**
   * Applies rotation to a specific bone with lerping.
   */
  private applyBoneRotation(boneName: string, rotation: Vector3 | undefined, alpha: number): void {
    if (!rotation) return

    const bone = this.bones.get(boneName)
    if (!bone) return

    // Convert Euler [x, y, z] to Quaternion
    BoneController.SCRATCH_EULER.set(rotation[0], rotation[1], rotation[2])
    BoneController.TARGET_QUATERNION.setFromEuler(BoneController.SCRATCH_EULER)

    // Smoothly interpolate current bone rotation towards target
    // We use slerp for quaternions to ensure smooth transitions
    bone.quaternion.slerp(BoneController.TARGET_QUATERNION, alpha)
  }

  /**
   * Resets all controlled bones to their default (zero) rotation.
   */
  reset(): void {
    const controlledBones = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
    BoneController.TARGET_QUATERNION.set(0, 0, 0, 1)

    controlledBones.forEach((name) => {
      const bone = this.bones.get(name)
      if (bone) {
        bone.quaternion.copy(BoneController.TARGET_QUATERNION)
      }
    })
  }
}
