import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

describe('BoneController', () => {
  let root: THREE.Group
  let bones: Record<string, THREE.Bone>
  let controller: BoneController

  beforeEach(() => {
    root = new THREE.Group()
    bones = {
      Head: new THREE.Bone(),
      Spine: new THREE.Bone(),
      LeftArm: new THREE.Bone(),
      RightArm: new THREE.Bone(),
      LeftUpperLeg: new THREE.Bone(),
      RightUpperLeg: new THREE.Bone(),
    }

    Object.entries(bones).forEach(([name, bone]) => {
      bone.name = name
      root.add(bone)
    })

    controller = new BoneController(root)
  })

  it('should find all relevant bones in the rig', () => {
    expect(controller.getBone('Head')).toBe(bones.Head)
    expect(controller.getBone('Spine')).toBe(bones.Spine)
    expect(controller.getBone('LeftArm')).toBe(bones.LeftArm)
    expect(controller.getBone('RightArm')).toBe(bones.RightArm)
    expect(controller.getBone('LeftUpperLeg')).toBe(bones.LeftUpperLeg)
    expect(controller.getBone('RightUpperLeg')).toBe(bones.RightUpperLeg)
  })

  it('should not find non-existent bones', () => {
    expect(controller.getBone('NonExistent')).toBeUndefined()
  })

  it('should apply rotation to bones from a BodyPose', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      leftArm: [Math.PI / 2, 0, 0],
    }

    // Update with delta large enough to complete lerp immediately (since we use Math.min(1.0, delta * speed))
    controller.update(pose, 1.0)

    const headEuler = new THREE.Euler().setFromQuaternion(bones.Head.quaternion)
    expect(headEuler.x).toBeCloseTo(0.1)
    expect(headEuler.y).toBeCloseTo(0.2)
    expect(headEuler.z).toBeCloseTo(0.3)

    const armEuler = new THREE.Euler().setFromQuaternion(bones.LeftArm.quaternion)
    expect(armEuler.x).toBeCloseTo(Math.PI / 2)
  })

  it('should smoothly interpolate rotations', () => {
    const pose: BodyPose = {
      spine: [1, 0, 0],
    }

    // Very small delta to check interpolation
    controller.update(pose, 0.01)

    const spineEuler = new THREE.Euler().setFromQuaternion(bones.Spine.quaternion)
    // Should have moved a bit, but not all the way
    expect(spineEuler.x).toBeGreaterThan(0)
    expect(spineEuler.x).toBeLessThan(1)
  })

  it('should handle missing pose properties gracefully', () => {
    const pose: BodyPose = {
      head: [1, 1, 1],
    }

    // Spine should remain at identity
    controller.update(pose, 1.0)

    expect(bones.Spine.quaternion.x).toBe(0)
    expect(bones.Spine.quaternion.y).toBe(0)
    expect(bones.Spine.quaternion.z).toBe(0)
    expect(bones.Spine.quaternion.w).toBe(1)
  })
})
