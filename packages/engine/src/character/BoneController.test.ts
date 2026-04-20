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
    boneNames.forEach((name) => {
      const bone = new THREE.Bone()
      bone.name = name
      bones.set(name, bone)
    })
    controller = new BoneController(bones)
  })

  it('should initialize with identity rotations', () => {
    bones.forEach((bone) => {
      expect(bone.quaternion.x).toBe(0)
      expect(bone.quaternion.y).toBe(0)
      expect(bone.quaternion.z).toBe(0)
      expect(bone.quaternion.w).toBe(1)
    })
  })

  it('should snap to pose immediately', () => {
    const pose: BodyPose = {
      head: [Math.PI / 4, 0, 0],
      leftArm: [0, 0, Math.PI / 2],
    }

    controller.snapToPose(pose)

    const headBone = bones.get('Head')!
    const leftArmBone = bones.get('LeftArm')!

    const expectedHeadQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, 0))
    const expectedArmQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))

    expect(headBone.quaternion.x).toBeCloseTo(expectedHeadQuat.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedHeadQuat.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedHeadQuat.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedHeadQuat.w)

    expect(leftArmBone.quaternion.x).toBeCloseTo(expectedArmQuat.x)
    expect(leftArmBone.quaternion.y).toBeCloseTo(expectedArmQuat.y)
    expect(leftArmBone.quaternion.z).toBeCloseTo(expectedArmQuat.z)
    expect(leftArmBone.quaternion.w).toBeCloseTo(expectedArmQuat.w)
  })

  it('should smoothly interpolate to pose over multiple updates', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    controller.setPose(pose)

    // First update (16ms)
    controller.update(0.016)

    const headBone = bones.get('Head')!
    // Should have moved from identity but not reached target yet
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.x).toBeLessThan(0.707) // sin(PI/4)

    // Many updates later
    for (let i = 0; i < 60; i++) {
      controller.update(0.016)
    }

    const finalQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
    expect(headBone.quaternion.x).toBeCloseTo(finalQuat.x, 2)
  })

  it('should reset all bones to identity', () => {
    const pose: BodyPose = {
      head: [1, 1, 1],
      spine: [1, 1, 1],
    }

    controller.snapToPose(pose)
    controller.reset()

    bones.forEach((bone) => {
      expect(bone.quaternion.x).toBe(0)
      expect(bone.quaternion.y).toBe(0)
      expect(bone.quaternion.z).toBe(0)
      expect(bone.quaternion.w).toBe(1)
    })
  })

  it('should handle missing bones gracefully', () => {
    const incompleteBones = new Map<string, THREE.Bone>()
    incompleteBones.set('Head', new THREE.Bone())
    const partialController = new BoneController(incompleteBones)

    const pose: BodyPose = {
      head: [1, 0, 0],
      spine: [1, 0, 0], // missing bone
    }

    expect(() => partialController.snapToPose(pose)).not.toThrow()
    expect(incompleteBones.get('Head')!.quaternion.x).toBeGreaterThan(0)
  })
})
