import * as THREE from 'three'
import { BodyPose } from '../types'

/**
 * BoneController — Manages manual character posing by overriding skeleton bone rotations.
 * Works alongside CharacterAnimator to allow fine-grained control over specific body parts.
 *
 * @module @animatica/engine/character/BoneController
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetPose: BodyPose = {}
  private lerpSpeed: number = 10.0

  // Static scratch variables to avoid garbage collection pressure in the animation loop
  private static _euler = new THREE.Euler()
  private static _quaternion = new THREE.Quaternion()

  // Mapping from BodyPose keys to standard humanoid bone names used in CharacterLoader
  private static BONE_MAP: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
  }

  /**
   * Create a new BoneController.
   * @param bones Map of bone names to THREE.Bone objects, typically from CharacterRig.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Set the target pose for the bones.
   * The controller will smoothly interpolate towards this pose in the update loop.
   * @param pose Partial BodyPose object containing Euler rotations as [x, y, z] in radians.
   */
  setPose(pose: BodyPose): void {
    this.targetPose = { ...pose }
  }

  /**
   * Update bone rotations using slerp for smooth transitions.
   * Should be called every frame, ideally after the main animator update.
   * @param delta Time since last frame in seconds.
   */
  update(delta: number): void {
    // Frame-rate independent interpolation
    const step = 1 - Math.exp(-this.lerpSpeed * delta)

    for (const [key, boneName] of Object.entries(BoneController.BONE_MAP)) {
      const bone = this.bones.get(boneName)
      if (!bone) continue

      const targetRotation = this.targetPose[key as keyof BodyPose]
      if (targetRotation) {
        BoneController._euler.set(targetRotation[0], targetRotation[1], targetRotation[2])
        BoneController._quaternion.setFromEuler(BoneController._euler)

        // Smoothly interpolate the bone's quaternion to the target
        bone.quaternion.slerp(BoneController._quaternion, step)
      }
    }
  }

  /**
   * Instantly apply a pose to the bones without interpolation.
   * @param pose Partial BodyPose object.
   */
  applyImmediate(pose: BodyPose): void {
    for (const [key, boneName] of Object.entries(BoneController.BONE_MAP)) {
      const bone = this.bones.get(boneName)
      if (!bone) continue

      const rotation = pose[key as keyof BodyPose]
      if (rotation) {
        bone.rotation.set(rotation[0], rotation[1], rotation[2])
      }
    }
  }

  /**
   * Set the interpolation speed.
   * @param speed Speed value (default: 10.0). Higher is faster.
   */
  setLerpSpeed(speed: number): void {
    this.lerpSpeed = speed
  }
}
