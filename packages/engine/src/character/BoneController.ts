import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Maps abstract BodyPose properties to Three.js bones.
 * Handles smooth interpolation of bone rotations to avoid snapping.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetQuaternions: Map<string, THREE.Quaternion> = new Map()
  private currentQuaternions: Map<string, THREE.Quaternion> = new Map()
  private lerpSpeed: number = 10.0 // units per second

  /**
   * Mapping from BodyPose keys to actual humanoid bone names.
   */
  private static readonly BONE_MAP: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
  }

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones

    // Initialize quaternions for mapped bones
    for (const boneName of Object.values(BoneController.BONE_MAP)) {
      const bone = this.bones.get(boneName)
      if (bone) {
        this.targetQuaternions.set(boneName, bone.quaternion.clone())
        this.currentQuaternions.set(boneName, bone.quaternion.clone())
      }
    }
  }

  /**
   * Updates the target pose. Rotations are expected as Euler angles in radians.
   * @param pose The new body pose overrides.
   */
  updatePose(pose?: BodyPose): void {
    if (!pose) return

    for (const [poseKey, rotation] of Object.entries(pose)) {
      const boneName = BoneController.BONE_MAP[poseKey as keyof BodyPose]
      if (!boneName || !rotation) continue

      const targetQuat = this.targetQuaternions.get(boneName)
      if (targetQuat) {
        const euler = new THREE.Euler(...(rotation as Vector3))
        targetQuat.setFromEuler(euler)
      }
    }
  }

  /**
   * Smoothly interpolates bone rotations towards target values.
   * Should be called in the rendering loop.
   * @param delta Time since last frame in seconds.
   */
  update(delta: number): void {
    const step = this.lerpSpeed * delta

    for (const [boneName, targetQuat] of this.targetQuaternions.entries()) {
      const currentQuat = this.currentQuaternions.get(boneName)
      const bone = this.bones.get(boneName)

      if (currentQuat && bone) {
        // Slerp current towards target
        currentQuat.slerp(targetQuat, Math.min(step, 1.0))
        // Apply to actual bone
        bone.quaternion.copy(currentQuat)
      }
    }
  }

  /**
   * Resets all controlled bones to their default (usually identity) rotation.
   */
  reset(): void {
    for (const boneName of Object.values(BoneController.BONE_MAP)) {
      const bone = this.bones.get(boneName)
      if (bone) {
        bone.quaternion.set(0, 0, 0, 1)
        this.targetQuaternions.get(boneName)?.set(0, 0, 0, 1)
        this.currentQuaternions.get(boneName)?.set(0, 0, 0, 1)
      }
    }
  }
}
