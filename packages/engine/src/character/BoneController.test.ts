import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

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

  it('should initialize with identity quaternions or current bone rotations', () => {
    const headBone = bones.get('Head')!
    expect(headBone.quaternion.x).toBe(0)
    expect(headBone.quaternion.y).toBe(0)
    expect(headBone.quaternion.z).toBe(0)
    expect(headBone.quaternion.w).toBe(1)
  })

  it('should update target quaternions when setPose is called', () => {
    const pose: BodyPose = {
      head: [Math.PI / 4, 0, 0], // 45 degrees pitch
    }
    controller.setPose(pose)

    // Update with large delta to reach target immediately (clamped to 1.0)
    controller.update(1.0)

    const headBone = bones.get('Head')!
    const expectedQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, 0))

    expect(headBone.quaternion.x).toBeCloseTo(expectedQuat.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedQuat.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedQuat.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedQuat.w)
  })

  it('should smoothly interpolate rotations over multiple frames', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }
    controller.setPose(pose)

    // Update with small delta
    controller.update(0.01) // 0.01 * 10 = 0.1 step

    const headBone = bones.get('Head')!
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.x).toBeLessThan(0.707) // sin(45/2) is ~0.38
  })

  it('should handle missing bones gracefully', () => {
    const partialBones = new Map<string, THREE.Bone>()
    const headBone = new THREE.Bone()
    headBone.name = 'Head'
    partialBones.set('Head', headBone)

    const partialController = new BoneController(partialBones)
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.1, 0.2, 0.3], // Bone doesn't exist
    }

    expect(() => {
      partialController.setPose(pose)
      partialController.update(0.1)
    }).not.toThrow()
  })

  it('should reset all bones to identity', () => {
    const pose: BodyPose = {
      head: [Math.PI, 0, 0],
    }
    controller.setPose(pose)
    controller.update(1.0)

    controller.reset()
    controller.update(1.0)

    const headBone = bones.get('Head')!
    expect(headBone.quaternion.x).toBe(0)
    expect(headBone.quaternion.w).toBe(1)
  })
})
