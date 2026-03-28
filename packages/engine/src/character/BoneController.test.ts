import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let root: THREE.Group
  let headBone: THREE.Bone
  let spineBone: THREE.Bone
  let controller: BoneController

  beforeEach(() => {
    root = new THREE.Group()
    headBone = new THREE.Bone()
    headBone.name = 'Head'
    spineBone = new THREE.Bone()
    spineBone.name = 'Spine'
    root.add(headBone, spineBone)
    controller = new BoneController(root, 1.0) // alpha = 1.0 for instant updates in tests
  })

  it('should find bones by name in the hierarchy', () => {
    // Accessing private property for testing purposes
    const bones = (controller as any).bones as Map<string, THREE.Bone>
    expect(bones.get('Head')).toBe(headBone)
    expect(bones.get('Spine')).toBe(spineBone)
    expect(bones.size).toBe(2)
  })

  it('should apply rotation from BodyPose to bones', () => {
    const pose: BodyPose = {
      head: [0.5, 0, 0], // x = 0.5 rad
    }

    controller.update(pose, 1 / 60)

    expect(headBone.rotation.x).toBeCloseTo(0.5)
    expect(headBone.rotation.y).toBeCloseTo(0)
    expect(headBone.rotation.z).toBeCloseTo(0)
  })

  it('should smoothly interpolate rotations when alpha < 1', () => {
    controller.setAlpha(0.5)
    const pose: BodyPose = {
      head: [1.0, 0, 0],
    }

    // delta = 1/60, so smoothing = 1 - (1 - 0.5)^1 = 0.5
    controller.update(pose, 1 / 60)

    // After 1 frame at 0.5 smoothing, should be halfway there
    expect(headBone.rotation.x).toBeCloseTo(0.5)

    controller.update(pose, 1 / 60)
    // After 2 frames, should be 0.75 there (half of remaining 0.5)
    expect(headBone.rotation.x).toBeCloseTo(0.75)
  })

  it('should be frame-rate independent', () => {
    controller.setAlpha(0.5)
    const pose: BodyPose = {
      head: [1.0, 0, 0],
    }

    // 2 frames at 1/60s (delta = 1/60)
    const headBone1 = new THREE.Bone()
    headBone1.name = 'Head'
    const root1 = new THREE.Group()
    root1.add(headBone1)
    const controller1 = new BoneController(root1, 0.5)
    controller1.update(pose, 1 / 60)
    controller1.update(pose, 1 / 60)

    // 1 frame at 2/60s (delta = 2/60)
    const headBone2 = new THREE.Bone()
    headBone2.name = 'Head'
    const root2 = new THREE.Group()
    root2.add(headBone2)
    const controller2 = new BoneController(root2, 0.5)
    controller2.update(pose, 2 / 60)

    // Results should be identical
    expect(headBone1.rotation.x).toBeCloseTo(headBone2.rotation.x)
    expect(headBone1.rotation.x).toBeCloseTo(0.75)
  })

  it('should ignore missing bones or pose properties', () => {
    const pose: BodyPose = {
      leftArm: [1, 1, 1], // LeftArm bone doesn't exist in our test rig
    }

    expect(() => controller.update(pose, 1 / 60)).not.toThrow()
    expect(headBone.rotation.x).toBe(0)
  })
})
