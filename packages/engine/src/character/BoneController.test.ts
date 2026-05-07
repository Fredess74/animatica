import { describe, expect, it, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

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

  it('should initialize correctly', () => {
    expect(controller).toBeDefined()
  })

  it('should set target rotations from BodyPose', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6],
    }
    controller.setPose(pose)

    // Internally targets are private, but we can verify by calling update
    controller.update(1.0) // Large delta should bring it very close to target

    const head = bones.get('Head')!
    const expectedHeadQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0.2, 0.3))
    expect(head.quaternion.x).toBeCloseTo(expectedHeadQuat.x)
    expect(head.quaternion.y).toBeCloseTo(expectedHeadQuat.y)
    expect(head.quaternion.z).toBeCloseTo(expectedHeadQuat.z)
    expect(head.quaternion.w).toBeCloseTo(expectedHeadQuat.w)
  })

  it('should smoothly interpolate over multiple updates', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }
    controller.setPose(pose)

    const head = bones.get('Head')!

    // First update with small delta
    controller.update(0.01)
    expect(head.quaternion.x).toBeGreaterThan(0)
    expect(head.quaternion.x).toBeLessThan(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)).x)

    // Second update with large delta
    controller.update(1.0)
    const expectedQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
    expect(head.quaternion.x).toBeCloseTo(expectedQuat.x)
  })

  it('should snap to pose immediately', () => {
    const pose: BodyPose = {
      leftArm: [0, 1, 0],
    }
    controller.snapToPose(pose)

    const leftArm = bones.get('LeftArm')!
    const expectedQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 1, 0))
    expect(leftArm.quaternion.y).toBeCloseTo(expectedQuat.y)
  })

  it('should reset all bones', () => {
    const pose: BodyPose = {
      head: [1, 1, 1],
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
    const emptyBones = new Map<string, THREE.Bone>()
    const partialController = new BoneController(emptyBones)

    const pose: BodyPose = {
      head: [1, 1, 1],
    }

    expect(() => {
      partialController.setPose(pose)
      partialController.update(0.1)
    }).not.toThrow()
  })
})
