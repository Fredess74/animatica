import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

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

  it('applies rotation to bones immediately when smoothing is 1', () => {
    controller.setSmoothing(1)
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    controller.update(pose, 1 / 60)

    // With smoothing 1, it should reach target in one frame
    // [PI/2, 0, 0] as Euler -> Quaternion
    const expected = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))

    expect(headBone.quaternion.x).toBeCloseTo(expected.x)
    expect(headBone.quaternion.y).toBeCloseTo(expected.y)
    expect(headBone.quaternion.z).toBeCloseTo(expected.z)
    expect(headBone.quaternion.w).toBeCloseTo(expected.w)
  })

  it('interpolates rotation when smoothing is less than 1', () => {
    controller.setSmoothing(0.5)
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    // First update
    controller.update(pose, 1 / 60)

    // With smoothing 0.5 and delta 1/60, alpha = 1 - (1-0.5)^1 = 0.5
    // It should be halfway to the target
    const target = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
    const initial = new THREE.Quaternion(0, 0, 0, 1)
    const expected = initial.clone().slerp(target, 0.5)

    expect(headBone.quaternion.x).toBeCloseTo(expected.x)
    expect(headBone.quaternion.y).toBeCloseTo(expected.y)
    expect(headBone.quaternion.z).toBeCloseTo(expected.z)
    expect(headBone.quaternion.w).toBeCloseTo(expected.w)
  })

  it('is frame-rate independent', () => {
    controller.setSmoothing(0.15)
    const pose: BodyPose = {
      head: [1, 0, 0],
    }

    // Case 1: One large step (1/30s)
    const headBone1 = new THREE.Bone()
    const controller1 = new BoneController(new Map([['Head', headBone1]]))
    controller1.setSmoothing(0.15)
    controller1.update(pose, 1 / 30)

    // Case 2: Two small steps (1/60s each)
    const headBone2 = new THREE.Bone()
    const controller2 = new BoneController(new Map([['Head', headBone2]]))
    controller2.setSmoothing(0.15)
    controller2.update(pose, 1 / 60)
    controller2.update(pose, 1 / 60)

    // Both should result in the same rotation
    expect(headBone1.quaternion.x).toBeCloseTo(headBone2.quaternion.x)
    expect(headBone1.quaternion.y).toBeCloseTo(headBone2.quaternion.y)
    expect(headBone1.quaternion.z).toBeCloseTo(headBone2.quaternion.z)
    expect(headBone1.quaternion.w).toBeCloseTo(headBone2.quaternion.w)
  })

  it('handles missing bones gracefully', () => {
    const pose: BodyPose = {
      leftArm: [1, 1, 1], // LeftArm bone is not in our map
    }

    expect(() => controller.update(pose, 0.016)).not.toThrow()
  })

  it('resets bones to identity rotation', () => {
    headBone.quaternion.set(1, 0, 0, 1).normalize()
    spineBone.quaternion.set(0, 1, 0, 1).normalize()

    controller.reset()

    expect(headBone.quaternion.x).toBe(0)
    expect(headBone.quaternion.y).toBe(0)
    expect(headBone.quaternion.z).toBe(0)
    expect(headBone.quaternion.w).toBe(1)

    expect(spineBone.quaternion.x).toBe(0)
    expect(spineBone.quaternion.y).toBe(0)
    expect(spineBone.quaternion.z).toBe(0)
    expect(spineBone.quaternion.w).toBe(1)
  })
})
