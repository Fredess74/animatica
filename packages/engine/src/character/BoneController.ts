import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Manages manual skeletal posing for a character.
 * Maps high-level BodyPose properties to specific Three.js bones and applies
 * smooth interpolation using slerp.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetPose: BodyPose = {}
  private lerpSpeed: number = 5 // Controls the smoothness of pose transitions

  // Scratch variables for optimization to avoid GC pressure in the render loop
  private static scratchEuler = new THREE.Euler()
  private static scratchQuaternion = new THREE.Quaternion()

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Sets the target pose for the character.
   * The controller will smoothly interpolate towards this pose in the update loop.
   */
  setPose(pose: BodyPose) {
    this.targetPose = { ...pose }
  }

  /**
   * Updates bone rotations based on the current target pose and delta time.
   * Should be called within the main animation loop (useFrame).
   */
  update(delta: number) {
    this.applyBoneRotation('head', 'Head', delta)
    this.applyBoneRotation('spine', 'Spine', delta)
    this.applyBoneRotation('leftArm', 'LeftArm', delta)
    this.applyBoneRotation('rightArm', 'RightArm', delta)
    this.applyBoneRotation('leftLeg', 'LeftUpperLeg', delta)
    this.applyBoneRotation('rightLeg', 'RightUpperLeg', delta)
  }

  /**
   * Interpolates and applies rotation to a specific bone.
   */
  private applyBoneRotation(
    poseKey: keyof BodyPose,
    boneName: string,
    delta: number
  ) {
    const targetRot = this.targetPose[poseKey] as Vector3 | undefined
    const bone = this.bones.get(boneName)

    if (!bone || !targetRot) return

    // Convert Euler angles (radians) to Quaternion for stable interpolation
    BoneController.scratchEuler.set(targetRot[0], targetRot[1], targetRot[2])
    BoneController.scratchQuaternion.setFromEuler(BoneController.scratchEuler)

    // Smoothly slerp the bone's current quaternion towards the target
    bone.quaternion.slerp(BoneController.scratchQuaternion, Math.min(1, delta * this.lerpSpeed))
  }
}
