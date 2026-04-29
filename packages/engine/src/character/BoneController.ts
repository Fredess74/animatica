import * as THREE from 'three'
import { BodyPose } from '../types'

// Static reusable objects to minimize GC
const tempEuler = new THREE.Euler()
const tempQuaternion = new THREE.Quaternion()

/**
 * BoneController — Manages manual character posing with smooth interpolation.
 * Maps abstract BodyPose properties to actual skeleton bones.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targets: Map<string, THREE.Quaternion> = new Map()
  private current: Map<string, THREE.Quaternion> = new Map()
  private lerpSpeed: number = 10.0 // Higher = faster response

  /**
   * Map from BodyPose keys to standard humanoid bone names.
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

    // Initialize current rotations from bones if they exist
    for (const boneName of Object.values(BoneController.BONE_MAP)) {
      const bone = this.bones.get(boneName)
      if (bone) {
        this.current.set(boneName, bone.quaternion.clone())
        this.targets.set(boneName, bone.quaternion.clone())
      }
    }
  }

  /**
   * Set the target pose for the character.
   * Properties not provided in the pose object will remain at their current target.
   */
  setPose(pose: BodyPose): void {
    for (const [poseKey, boneName] of Object.entries(BoneController.BONE_MAP)) {
      const rotation = pose[poseKey as keyof BodyPose]
      if (rotation) {
        const targetQuat = new THREE.Quaternion().setFromEuler(
          tempEuler.set(rotation[0], rotation[1], rotation[2])
        )
        this.targets.set(boneName, targetQuat)
      }
    }
  }

  /**
   * Update bone rotations (call every frame).
   * Performs smooth slerp interpolation between current and target rotations.
   */
  update(delta: number): void {
    const step = Math.min(delta * this.lerpSpeed, 1.0)

    for (const [boneName, targetQuat] of this.targets.entries()) {
      const bone = this.bones.get(boneName)
      const currentQuat = this.current.get(boneName)

      if (bone && currentQuat) {
        // Slerp current towards target
        currentQuat.slerp(targetQuat, step)

        // Apply to bone (this overrides any animation currently playing on these bones)
        bone.quaternion.copy(currentQuat)
      }
    }
  }

  /**
   * Reset all bones to their default (zero) rotations.
   */
  reset(): void {
    tempEuler.set(0, 0, 0)
    tempQuaternion.setFromEuler(tempEuler)

    for (const boneName of Object.values(BoneController.BONE_MAP)) {
      this.targets.set(boneName, tempQuaternion.clone())
    }
  }
}
