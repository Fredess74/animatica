import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Maps abstract BodyPose data to Three.js skeleton bones.
 * Handles smooth interpolation of bone rotations.
 *
 * @module @animatica/engine/character
 */
export class BoneController {
  private bones: Map<string, THREE.Bone>
  private lerpSpeed: number = 10.0 // Units per second for smooth rotation

  // Reuse objects to avoid allocation in update loop
  private static readonly _euler = new THREE.Euler()
  private static readonly _quaternion = new THREE.Quaternion()

  /**
   * Creates a new BoneController.
   * @param bones Map of bone names to THREE.Bone objects.
   */
  constructor(bones: Map<string, THREE.Bone>) {
    this.bones = bones
  }

  /**
   * Update bone rotations based on the provided BodyPose.
   * Uses spherical linear interpolation (slerp) for smooth transitions.
   *
   * @param pose The target body pose containing Euler rotations in radians.
   * @param delta Time elapsed since last frame in seconds.
   */
  update(pose: BodyPose, delta: number): void {
    if (pose.head) this.applyRotation('Head', pose.head, delta)
    if (pose.spine) this.applyRotation('Spine', pose.spine, delta)
    if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm, delta)
    if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm, delta)
    if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg, delta)
    if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg, delta)
  }

  /**
   * Apply rotation to a specific bone with smooth interpolation.
   */
  private applyRotation(boneName: string, rotation: Vector3, delta: number): void {
    const bone = this.bones.get(boneName)
    if (!bone) return

    // Convert Euler [x, y, z] to Quaternion for stable interpolation
    // Use the static scratch objects to avoid GC pressure
    BoneController._euler.set(...rotation)
    BoneController._quaternion.setFromEuler(BoneController._euler)

    // Smoothly interpolate current rotation toward target
    // We use min(delta * speed, 1) to ensure we don't over-rotate if delta is large
    bone.quaternion.slerp(BoneController._quaternion, Math.min(delta * this.lerpSpeed, 1.0))
  }

  /**
   * Set rotations immediately without interpolation.
   * Useful for initialization or teleporting to a specific pose.
   *
   * @param pose The target body pose.
   */
  setImmediate(pose: BodyPose): void {
    if (pose.head) this.setBoneRotation('Head', pose.head)
    if (pose.spine) this.setBoneRotation('Spine', pose.spine)
    if (pose.leftArm) this.setBoneRotation('LeftArm', pose.leftArm)
    if (pose.rightArm) this.setBoneRotation('RightArm', pose.rightArm)
    if (pose.leftLeg) this.setBoneRotation('LeftUpperLeg', pose.leftLeg)
    if (pose.rightLeg) this.setBoneRotation('RightUpperLeg', pose.rightLeg)
  }

  /**
   * Helper to set bone rotation directly.
   */
  private setBoneRotation(boneName: string, rotation: Vector3): void {
    const bone = this.bones.get(boneName)
    if (!bone) return
    bone.rotation.set(...rotation)
  }

  /**
   * Set the interpolation speed.
   * @param speed Speed in units per second (default 10).
   */
  setLerpSpeed(speed: number): void {
    this.lerpSpeed = speed
  }
}
