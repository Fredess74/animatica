import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let controller: BoneController

  beforeEach(() => {
    bones = new Map()
    const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
    boneNames.forEach(name => {
      const bone = new THREE.Bone()
      bone.name = name
      bones.set(name, bone)
    })
    controller = new BoneController(bones)
  })

  it('maps pose to bones correctly', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      leftArm: [Math.PI / 2, 0, 0]
    }

    controller.updatePose(pose)
    // Update with delta large enough to complete lerp immediately (10.0 * 0.1 = 1.0)
    controller.update(0.1)

    const headBone = bones.get('Head')!
    const expectedHeadEuler = new THREE.Euler(0.1, 0.2, 0.3)
    const expectedHeadQuat = new THREE.Quaternion().setFromEuler(expectedHeadEuler)

    expect(headBone.quaternion.x).toBeCloseTo(expectedHeadQuat.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedHeadQuat.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedHeadQuat.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedHeadQuat.w)

    const leftArmBone = bones.get('LeftArm')!
    expect(leftArmBone.quaternion.x).toBeCloseTo(Math.sin(Math.PI / 4))
    expect(leftArmBone.quaternion.w).toBeCloseTo(Math.cos(Math.PI / 4))
  })

  it('interpolates rotations over time', () => {
    const pose: BodyPose = {
      head: [Math.PI, 0, 0]
    }

    controller.updatePose(pose)

    // Halfway (lerpSpeed = 10.0, delta = 0.05 => 0.5)
    // Note: Slerp is not linear on components but we expect movement
    controller.update(0.05)

    const headBone = bones.get('Head')!
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.x).toBeLessThan(1.0)

    // Finish (another 0.1s to be sure it reaches 1.0)
    controller.update(0.1)
    expect(headBone.quaternion.x).toBeCloseTo(1.0)
    expect(headBone.quaternion.w).toBeCloseTo(0)
  })

  it('handles missing bones gracefully', () => {
    const limitedBones = new Map<string, THREE.Bone>()
    const headBone = new THREE.Bone()
    headBone.name = 'Head'
    limitedBones.set('Head', headBone)

    const limitedController = new BoneController(limitedBones)
    const pose: BodyPose = {
      head: [1, 0, 0],
      spine: [0, 1, 0] // Missing in map
    }

    expect(() => {
      limitedController.updatePose(pose)
      limitedController.update(0.1)
    }).not.toThrow()

    expect(headBone.quaternion.x).toBeGreaterThan(0)
  })

  it('resets bones to identity', () => {
    const pose: BodyPose = {
      head: [1, 1, 1]
    }
    controller.updatePose(pose)
    controller.update(0.1)

    controller.reset()
    const headBone = bones.get('Head')!
    expect(headBone.quaternion.x).toBe(0)
    expect(headBone.quaternion.y).toBe(0)
    expect(headBone.quaternion.z).toBe(0)
    expect(headBone.quaternion.w).toBe(1)
  })
})
