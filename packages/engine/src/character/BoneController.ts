import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Manages manual character posing by mapping BodyPose data
 * to skeletal bones with smooth, frame-rate independent interpolation.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private targetPose: BodyPose = {}
  private lerpFactor: number = 5.0 // Speed of interpolation (higher = faster)

  // Reusable objects to avoid GC pressure
  private static tempQuaternion = new THREE.Quaternion()
  private static tempEuler = new THREE.Euler()

  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Sets the target pose to interpolate towards.
   * @param pose The new body pose.
   */
  public setPose(pose: BodyPose): void {
    this.targetPose = { ...pose }
  }

  /**
   * Updates the bone rotations based on the current target pose.
   * Should be called within a useFrame or animation loop.
   * @param delta Time since last frame in seconds.
   */
  public update(delta: number): void {
    if (!this.targetPose) return

    // Calculate alpha for frame-rate independent lerping
    // Using 1 - exp(-speed * delta) for smooth convergence
    const alpha = 1 - Math.exp(-this.lerpFactor * delta)

    this.applyBoneRotation('Head', alpha, this.targetPose.head)
    this.applyBoneRotation('Spine', alpha, this.targetPose.spine)
    this.applyBoneRotation('LeftArm', alpha, this.targetPose.leftArm)
    this.applyBoneRotation('RightArm', alpha, this.targetPose.rightArm)
    this.applyBoneRotation('LeftUpperLeg', alpha, this.targetPose.leftLeg)
    this.applyBoneRotation('RightUpperLeg', alpha, this.targetPose.rightLeg)
  }

  /**
   * Applies rotation to a specific bone using slerp for smoothness.
   */
  private applyBoneRotation(boneName: string, alpha: number, rotation?: Vector3): void {
    if (!rotation) return
    const bone = this.bones.get(boneName)
    if (!bone) return

    BoneController.tempEuler.set(rotation[0], rotation[1], rotation[2])
    BoneController.tempQuaternion.setFromEuler(BoneController.tempEuler)

    // Smoothly interpolate towards the target rotation
    bone.quaternion.slerp(BoneController.tempQuaternion, alpha)
  }

  /**
   * Sets the interpolation speed.
   * @param speed Convergence speed (default: 5.0).
   */
  public setSpeed(speed: number): void {
    this.lerpFactor = Math.max(0.1, speed)
  }
}
