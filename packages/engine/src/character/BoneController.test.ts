import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

describe('BoneController', () => {
  const createMockBone = (name: string) => {
    const bone = new THREE.Bone()
    bone.name = name
    return bone
  }

  it('should apply rotation to bones when setPose is called', () => {
    const headBone = createMockBone('Head')
    const bones = new Map<string, THREE.Bone>([['Head', headBone]])
    const controller = new BoneController(bones)

    const pose: BodyPose = {
      head: [Math.PI / 4, 0, 0],
    }

    controller.setPose(pose)
    // Update with delta = 1 to ensure it completes slerp if speed is high enough
    // but slerp(target, 1 * 5) will definitely hit the target.
    controller.update(1)

    // Check if the bone's quaternion roughly matches the target rotation
    const expectedQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI / 4, 0, 0)
    )

    expect(headBone.quaternion.x).toBeCloseTo(expectedQuat.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedQuat.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedQuat.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedQuat.w)
  })

  it('should interpolate towards the target pose over multiple updates', () => {
    const headBone = createMockBone('Head')
    const bones = new Map<string, THREE.Bone>([['Head', headBone]])
    const controller = new BoneController(bones)

    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    controller.setPose(pose)

    // Small delta should move it partially
    controller.update(0.01)
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.x).toBeLessThan(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)).x)

    // Large delta or multiple updates should reach target
    controller.update(1.0)
    const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
    expect(headBone.quaternion.x).toBeCloseTo(targetQuat.x)
  })

  it('should handle missing bones gracefully', () => {
    const bones = new Map<string, THREE.Bone>()
    const controller = new BoneController(bones)

    const pose: BodyPose = {
      head: [1, 1, 1],
    }

    // Should not throw
    expect(() => {
      controller.setPose(pose)
      controller.update(0.1)
    }).not.toThrow()
  })

  it('should only update specified bones in partial pose', () => {
    const headBone = createMockBone('Head')
    const spineBone = createMockBone('Spine')
    const bones = new Map<string, THREE.Bone>([
      ['Head', headBone],
      ['Spine', spineBone],
    ])
    const controller = new BoneController(bones)

    const pose: BodyPose = {
      head: [Math.PI / 4, 0, 0],
    }

    controller.setPose(pose)
    controller.update(1)

    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(spineBone.quaternion.x).toBe(0) // Should remain at zero
  })
})
