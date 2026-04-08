import * as THREE from 'three'
import { BodyPose, Vector3 } from '../types'

// Scratch variables to avoid GC pressure in the update loop
const _euler = new THREE.Euler()
const _quaternion = new THREE.Quaternion()

/**
 * BoneController manages per-bone rotation overrides for character actors.
 * It maps the abstract BodyPose interface to specific humanoid skeleton bones.
 *
 * This controller allows for manual posing of characters on top of or instead of
 * skeletal animations.
 */
export class BoneController {
  private bones: Map<string, THREE.Bone> = new Map()
  private lerpSpeed: number

  /**
   * @param root The root object of the character rig to search for bones.
   * @param lerpSpeed The speed at which rotations are interpolated (default: 10).
   */
  constructor(root: THREE.Object3D, lerpSpeed: number = 10.0) {
    this.lerpSpeed = lerpSpeed
    root.traverse((child) => {
      if (child instanceof THREE.Bone) {
        this.bones.set(child.name, child)
      }
    })
  }

  /**
   * Applies the given body pose overrides to the character's bones.
   * Should be called in the render loop, ideally after the animator update.
   *
   * @param pose The BodyPose object containing rotation overrides.
   * @param delta The frame delta time in seconds.
   */
  public update(pose: BodyPose, delta: number): void {
    if (!pose) return

    if (pose.head) this.applyRotation('Head', pose.head, delta)
    if (pose.spine) this.applyRotation('Spine', pose.spine, delta)
    if (pose.leftArm) this.applyRotation('LeftArm', pose.leftArm, delta)
    if (pose.rightArm) this.applyRotation('RightArm', pose.rightArm, delta)
    if (pose.leftLeg) this.applyRotation('LeftUpperLeg', pose.leftLeg, delta)
    if (pose.rightLeg) this.applyRotation('RightUpperLeg', pose.rightLeg, delta)
  }

  /**
   * Finds a bone by its humanoid name.
   * @param name The bone name (e.g., 'Head', 'Spine').
   * @returns The THREE.Bone if found, otherwise undefined.
   */
  public getBone(name: string): THREE.Bone | undefined {
    return this.bones.get(name)
  }

  private applyRotation(boneName: string, rotation: Vector3, delta: number): void {
    const bone = this.bones.get(boneName)
    if (!bone) return

    _euler.set(...rotation)
    _quaternion.setFromEuler(_euler)

    // Smoothly interpolate to the target rotation
    // Note: This overrides any animation currently playing on this bone if called after animator.update()
    bone.quaternion.slerp(_quaternion, Math.min(1.0, delta * this.lerpSpeed))
  }
}
