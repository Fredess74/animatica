import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let controller: BoneController
  let headBone: THREE.Bone
  let armBone: THREE.Bone

  beforeEach(() => {
    bones = new Map()
    headBone = new THREE.Bone()
    headBone.name = 'Head'
    armBone = new THREE.Bone()
    armBone.name = 'LeftArm'

    bones.set('Head', headBone)
    bones.set('LeftArm', armBone)

    controller = new BoneController(bones)
  })

  it('sets target pose correctly', () => {
    const pose: BodyPose = {
      head: [Math.PI / 4, 0, 0],
    }
    controller.setPose(pose)

    // update with delta=1 should reach target immediately (with high blend speed)
    controller.setBlendSpeed(100)
    controller.update(0.1)

    const expected = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, 0))
    expect(headBone.quaternion.x).toBeCloseTo(expected.x)
    expect(headBone.quaternion.y).toBeCloseTo(expected.y)
    expect(headBone.quaternion.z).toBeCloseTo(expected.z)
    expect(headBone.quaternion.w).toBeCloseTo(expected.w)
  })

  it('smoothly interpolates towards target', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }
    controller.setPose(pose)
    controller.setBlendSpeed(1.0)

    // Halfway step
    controller.update(0.5)

    // Initial was identity (0,0,0,1)
    // Target is (sin(pi/4), 0, 0, cos(pi/4)) = (0.707, 0, 0, 0.707)
    // At 0.5, it should be between them.
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.x).toBeLessThan(0.707)
  })

  it('handles missing bones gracefully', () => {
    const pose: BodyPose = {
      rightArm: [1, 1, 1], // Not in our bones Map
    }
    expect(() => {
      controller.setPose(pose)
      controller.update(0.1)
    }).not.toThrow()
  })

  it('clears target when property is missing in pose', () => {
    controller.setPose({ head: [1, 0, 0] })
    controller.setBlendSpeed(100)
    controller.update(0.1)

    const intermediateX = headBone.quaternion.x
    expect(intermediateX).toBeGreaterThan(0)

    controller.setPose({}) // Clear pose

    // It shouldn't move further if target is cleared
    controller.update(0.1)
    expect(headBone.quaternion.x).toBe(intermediateX)
  })
})
