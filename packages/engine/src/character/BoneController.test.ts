import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let headBone: THREE.Bone
  let leftArmBone: THREE.Bone
  let controller: BoneController

  beforeEach(() => {
    headBone = new THREE.Bone()
    headBone.name = 'Head'
    leftArmBone = new THREE.Bone()
    leftArmBone.name = 'LeftArm'

    bones = new Map()
    bones.set('Head', headBone)
    bones.set('LeftArm', leftArmBone)

    controller = new BoneController(bones)
  })

  it('should apply immediate pose', () => {
    const pose = {
      head: [0.1, 0.2, 0.3] as [number, number, number],
      leftArm: [0.5, 0.6, 0.7] as [number, number, number],
    }

    controller.applyImmediate(pose)

    expect(headBone.rotation.x).toBeCloseTo(0.1)
    expect(headBone.rotation.y).toBeCloseTo(0.2)
    expect(headBone.rotation.z).toBeCloseTo(0.3)

    expect(leftArmBone.rotation.x).toBeCloseTo(0.5)
    expect(leftArmBone.rotation.y).toBeCloseTo(0.6)
    expect(leftArmBone.rotation.z).toBeCloseTo(0.7)
  })

  it('should interpolate towards target pose in update', () => {
    const pose = {
      head: [Math.PI / 2, 0, 0] as [number, number, number],
    }

    controller.setPose(pose)
    controller.setLerpSpeed(1.0)

    // Initial state
    expect(headBone.quaternion.x).toBe(0)
    expect(headBone.quaternion.y).toBe(0)
    expect(headBone.quaternion.z).toBe(0)
    expect(headBone.quaternion.w).toBe(1)

    // Update with 0.5s delta (50% of the way because lerpSpeed=1.0)
    controller.update(0.5)

    // Halfway to PI/2 on X axis is roughly sin(PI/8)
    // Actually slerp is a bit more complex, but it should have moved
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.w).toBeLessThan(1)

    // Update with another large delta to complete
    controller.update(10.0)

    // Should be at target: sin(PI/4) for X, cos(PI/4) for W
    const expectedX = Math.sin(Math.PI / 4)
    const expectedW = Math.cos(Math.PI / 4)
    expect(headBone.quaternion.x).toBeCloseTo(expectedX)
    expect(headBone.quaternion.w).toBeCloseTo(expectedW)
  })

  it('should ignore missing bones gracefully', () => {
    const pose = {
      rightArm: [1, 1, 1] as [number, number, number],
    }

    // Should not throw even though 'RightArm' is not in the map
    expect(() => {
      controller.applyImmediate(pose)
      controller.setPose(pose)
      controller.update(0.1)
    }).not.toThrow()
  })
})
