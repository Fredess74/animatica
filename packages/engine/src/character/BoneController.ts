import * as THREE from 'three'
import type { BodyPose } from '../types'

/**
 * BoneController — Maps BodyPose properties to skeleton bone rotations.
 * Implements frame-rate independent rotation smoothing.
 *
 * Formula: lerpFactor = 1 - (1 - alpha)^(delta * 60)
 */
export class BoneController {
  private bones: Map<string, THREE.Bone> = new Map()
  private alpha: number = 0.1 // Default smoothing factor (0-1)

  // Pre-allocated scratch variables to avoid GC pressure in update loop
  private static readonly SCRATCH_EULER = new THREE.Euler()
  private static readonly SCRATCH_QUATERNION = new THREE.Quaternion()

  // Mapping from BodyPose property names to standard humanoid bone names
  private static readonly BONE_MAP: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
  }

  /**
   * @param root The root object of the character rig (containing bones)
   * @param alpha Smoothing factor (0.1 = medium, 0.5 = fast, 0.01 = very slow)
   */
  constructor(root: THREE.Object3D, alpha: number = 0.1) {
    this.alpha = alpha
    this.initBones(root)
  }

  private initBones(root: THREE.Object3D) {
    root.traverse((child) => {
      if (child instanceof THREE.Bone) {
        this.bones.set(child.name, child)
      }
    })
  }

  /**
   * Update bone rotations based on BodyPose with smoothing.
   * @param pose The target BodyPose from the actor state
   * @param delta Frame delta time in seconds (from useFrame)
   */
  public update(pose: BodyPose, delta: number) {
    if (!pose) return

    // Frame-rate independent smoothing factor (normalized to 60fps)
    // At delta = 1/60, smoothing = alpha
    const smoothing = 1 - Math.pow(1 - this.alpha, delta * 60)

    for (const key of Object.keys(BoneController.BONE_MAP)) {
      const poseKey = key as keyof BodyPose
      const boneName = BoneController.BONE_MAP[poseKey]
      const rotation = pose[poseKey]

      if (rotation) {
        const bone = this.bones.get(boneName)
        if (bone) {
          // Smoothly interpolate current rotation to target rotation
          // Vector3 in types is [number, number, number] (radians)
          BoneController.SCRATCH_EULER.set(rotation[0], rotation[1], rotation[2])
          BoneController.SCRATCH_QUATERNION.setFromEuler(BoneController.SCRATCH_EULER)

          bone.quaternion.slerp(BoneController.SCRATCH_QUATERNION, smoothing)
        }
      }
    }
  }

  /**
   * Set the smoothing factor (alpha).
   * @param alpha Value between 0 and 1 (lower = smoother, higher = tighter)
   */
  public setAlpha(alpha: number) {
    this.alpha = Math.max(0, Math.min(1, alpha))
  }
}
