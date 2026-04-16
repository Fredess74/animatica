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

  it('should apply rotation to bones based on BodyPose', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6],
      leftArm: [0.7, 0.8, 0.1],
      rightArm: [0.1, 0.2, 0.3],
      leftLeg: [0.4, 0.5, 0.6],
      rightLeg: [0.7, 0.8, 0.1],
    }

    controller.update(pose)

    const expectedEulers: Record<string, [number, number, number]> = {
      'Head': [0.1, 0.2, 0.3],
      'Spine': [0.4, 0.5, 0.6],
      'LeftArm': [0.7, 0.8, 0.1],
      'RightArm': [0.1, 0.2, 0.3],
      'LeftUpperLeg': [0.4, 0.5, 0.6],
      'RightUpperLeg': [0.7, 0.8, 0.1],
    }

    Object.entries(expectedEulers).forEach(([name, rot]) => {
      const bone = bones.get(name)!
      // Using a scratch euler with same order to verify
      const euler = new THREE.Euler().setFromQuaternion(bone.quaternion)
      expect(euler.x).toBeCloseTo(rot[0])
      expect(euler.y).toBeCloseTo(rot[1])
      expect(euler.z).toBeCloseTo(rot[2])
    })
  })

  it('should handle partial BodyPose', () => {
    const pose: BodyPose = {
      head: [0.5, 0.5, 0.5]
    }

    controller.update(pose)

    const headBone = bones.get('Head')!
    const headEuler = new THREE.Euler().setFromQuaternion(headBone.quaternion)
    expect(headEuler.x).toBeCloseTo(0.5)

    const spineBone = bones.get('Spine')!
    expect(spineBone.quaternion.x).toBe(0)
    expect(spineBone.quaternion.y).toBe(0)
    expect(spineBone.quaternion.z).toBe(0)
    expect(spineBone.quaternion.w).toBe(1)
  })

  it('should do nothing if pose is undefined', () => {
    expect(() => controller.update(undefined as any)).not.toThrow()
  })

  it('should skip missing bones gracefully', () => {
    const incompleteBones = new Map<string, THREE.Bone>()
    const headBone = new THREE.Bone()
    headBone.name = 'Head'
    incompleteBones.set('Head', headBone)

    const controllerWithMissingBones = new BoneController(incompleteBones)
    const pose: BodyPose = {
      head: [0.1, 0.1, 0.1],
      spine: [0.2, 0.2, 0.2] // Missing bone
    }

    expect(() => controllerWithMissingBones.update(pose)).not.toThrow()
    const headEuler = new THREE.Euler().setFromQuaternion(headBone.quaternion)
    expect(headEuler.x).toBeCloseTo(0.1)
  })
})
