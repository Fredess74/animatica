import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let controller: BoneController
  let headBone: THREE.Bone
  let spineBone: THREE.Bone

  beforeEach(() => {
    bones = new Map()
    headBone = new THREE.Bone()
    headBone.name = 'Head'
    spineBone = new THREE.Bone()
    spineBone.name = 'Spine'

    bones.set('Head', headBone)
    bones.set('Spine', spineBone)

    controller = new BoneController(bones)
  })

  it('should apply rotation to bones from BodyPose', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    controller.updatePose(pose)
    // Apply with delta 1s and instant smoothing to verify direct match
    controller.setSmoothing(1.0)
    controller.apply(1 / 60)

    const expectedQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
    expect(headBone.quaternion.x).toBeCloseTo(expectedQuat.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedQuat.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedQuat.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedQuat.w)
  })

  it('should smooth transitions between poses', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    controller.updatePose(pose)
    controller.setSmoothing(0.1) // 10% per 1/60s frame

    // Initial state [0,0,0,1]
    controller.apply(1 / 60)

    // Should be partially rotated
    expect(headBone.quaternion.w).toBeLessThan(1.0)
    expect(headBone.quaternion.x).toBeGreaterThan(0)

    const firstStepX = headBone.quaternion.x

    // Apply another step
    controller.apply(1 / 60)
    expect(headBone.quaternion.x).toBeGreaterThan(firstStepX)
  })

  it('should ignore missing bones gracefully', () => {
    const pose: BodyPose = {
      leftArm: [1, 1, 1], // LeftArm not in our mock bones Map
    }

    expect(() => {
      controller.updatePose(pose)
      controller.apply(1 / 60)
    }).not.toThrow()
  })

  it('should reset all overrides', () => {
    const pose: BodyPose = {
      head: [1, 0, 0],
    }
    controller.updatePose(pose)
    controller.setSmoothing(1.0)
    controller.apply(1 / 60)

    expect(headBone.quaternion.x).not.toBe(0)

    controller.reset()
    // Even if we apply, it shouldn't move further or should remain at current if slerping to nothing?
    // Wait, apply() iterates over targetQuaternions. reset() clears them.
    // So apply() after reset() does nothing.

    const quatAfterReset = headBone.quaternion.clone()
    controller.apply(1 / 60)
    expect(headBone.quaternion.equals(quatAfterReset)).toBe(true)
  })
})
