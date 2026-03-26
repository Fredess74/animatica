import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let controller: BoneController

  beforeEach(() => {
    bones = new Map()
    const boneNames = [
      'Head',
      'Spine',
      'LeftArm',
      'RightArm',
      'LeftUpperLeg',
      'RightUpperLeg',
    ]

    boneNames.forEach((name) => {
      const bone = new THREE.Bone()
      bone.name = name
      bones.set(name, bone)
    })

    controller = new BoneController(bones)
  })

  it('should apply rotation to specific bones', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      leftArm: [1, 0, 0],
    }

    controller.update(pose)

    const head = bones.get('Head')!
    const headEuler = new THREE.Euler().setFromQuaternion(head.quaternion)
    expect(headEuler.x).toBeCloseTo(0.1)
    expect(headEuler.y).toBeCloseTo(0.2)
    expect(headEuler.z).toBeCloseTo(0.3)

    const leftArm = bones.get('LeftArm')!
    const leftArmEuler = new THREE.Euler().setFromQuaternion(leftArm.quaternion)
    expect(leftArmEuler.x).toBeCloseTo(1)
    expect(leftArmEuler.y).toBeCloseTo(0)
    expect(leftArmEuler.z).toBeCloseTo(0)

    // Unmodified bones should stay at zero
    const spine = bones.get('Spine')!
    expect(spine.quaternion.x).toBe(0)
    expect(spine.quaternion.y).toBe(0)
    expect(spine.quaternion.z).toBe(0)
    expect(spine.quaternion.w).toBe(1)
  })

  it('should map leg pose to UpperLeg bones', () => {
    const pose: BodyPose = {
      leftLeg: [0.5, 0, 0],
      rightLeg: [0, 0.5, 0],
    }

    controller.update(pose)

    const leftLeg = bones.get('LeftUpperLeg')!
    expect(leftLeg.quaternion.x).toBeGreaterThan(0)

    const rightLeg = bones.get('RightUpperLeg')!
    expect(rightLeg.quaternion.y).toBeGreaterThan(0)
  })

  it('should handle missing bones gracefully', () => {
    const limitedBones = new Map<string, THREE.Bone>()
    const head = new THREE.Bone()
    head.name = 'Head'
    limitedBones.set('Head', head)

    const limitedController = new BoneController(limitedBones)

    const pose: BodyPose = {
      head: [1, 1, 1],
      spine: [1, 1, 1], // Bone doesn't exist in map
    }

    // Should not throw
    expect(() => limitedController.update(pose)).not.toThrow()
    expect(head.quaternion.x).toBeGreaterThan(0)
  })

  it('should reset bones to default rotation', () => {
    const pose: BodyPose = {
      head: [1, 1, 1],
      spine: [1, 1, 1],
    }

    controller.update(pose)
    controller.reset()

    bones.forEach((bone) => {
      expect(bone.quaternion.x).toBe(0)
      expect(bone.quaternion.y).toBe(0)
      expect(bone.quaternion.z).toBe(0)
      expect(bone.quaternion.w).toBe(1)
    })
  })
})
