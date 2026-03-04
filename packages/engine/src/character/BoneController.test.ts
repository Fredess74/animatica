import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let boneMap: Map<string, THREE.Bone>
  let headBone: THREE.Bone
  let spineBone: THREE.Bone
  let leftArmBone: THREE.Bone
  let rightArmBone: THREE.Bone
  let leftLegBone: THREE.Bone
  let rightLegBone: THREE.Bone
  let controller: BoneController

  beforeEach(() => {
    headBone = new THREE.Bone()
    spineBone = new THREE.Bone()
    leftArmBone = new THREE.Bone()
    rightArmBone = new THREE.Bone()
    leftLegBone = new THREE.Bone()
    rightLegBone = new THREE.Bone()

    boneMap = new Map([
      ['Head', headBone],
      ['Spine', spineBone],
      ['LeftArm', leftArmBone],
      ['RightArm', rightArmBone],
      ['LeftUpperLeg', leftLegBone],
      ['RightUpperLeg', rightLegBone],
    ])

    controller = new BoneController(boneMap)
  })

  it('should apply rotations to bones correctly', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6],
      leftArm: [0.7, 0.8, 0.9],
      rightArm: [1.0, 1.1, 1.2],
      leftLeg: [1.3, 1.4, 1.5],
      rightLeg: [1.6, 1.7, 1.8],
    }

    controller.update(pose)

    expect(headBone.rotation.x).toBeCloseTo(0.1)
    expect(headBone.rotation.y).toBeCloseTo(0.2)
    expect(headBone.rotation.z).toBeCloseTo(0.3)

    expect(spineBone.rotation.x).toBeCloseTo(0.4)
    expect(spineBone.rotation.y).toBeCloseTo(0.5)
    expect(spineBone.rotation.z).toBeCloseTo(0.6)

    expect(leftArmBone.rotation.x).toBeCloseTo(0.7)
    expect(rightArmBone.rotation.x).toBeCloseTo(1.0)
    expect(leftLegBone.rotation.x).toBeCloseTo(1.3)
    expect(rightLegBone.rotation.x).toBeCloseTo(1.6)
  })

  it('should only update provided bones', () => {
    const pose: BodyPose = {
      head: [0.5, 0.5, 0.5],
    }

    // Initialize with non-zero
    spineBone.rotation.set(0.1, 0.1, 0.1)

    controller.update(pose)

    expect(headBone.rotation.x).toBeCloseTo(0.5)
    expect(spineBone.rotation.x).toBeCloseTo(0.1)
  })

  it('should reset bones correctly', () => {
    headBone.rotation.set(1, 1, 1)
    spineBone.rotation.set(1, 1, 1)

    controller.reset()

    expect(headBone.rotation.x).toBe(0)
    expect(headBone.rotation.y).toBe(0)
    expect(headBone.rotation.z).toBe(0)
    expect(spineBone.rotation.x).toBe(0)
  })

  it('should handle missing bones gracefully', () => {
    const emptyMap = new Map<string, THREE.Bone>()
    const emptyController = new BoneController(emptyMap)

    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
    }

    // Should not throw
    expect(() => emptyController.update(pose)).not.toThrow()
  })
})
