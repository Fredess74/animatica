import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { CharacterRig } from './CharacterLoader'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let rig: CharacterRig
  let controller: BoneController
  let bones: Map<string, THREE.Bone>

  beforeEach(() => {
    bones = new Map()
    const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']

    boneNames.forEach(name => {
      const bone = new THREE.Bone()
      bone.name = name
      bones.set(name, bone)
    })

    rig = {
      root: new THREE.Group(),
      bodyMesh: null,
      skeleton: null,
      bones,
      morphTargetMap: {},
      animations: []
    }

    controller = new BoneController(rig)
  })

  it('should apply rotation to mapped bones', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      leftArm: [1.0, 0, 0]
    }

    controller.setPose(pose)

    const head = bones.get('Head')!
    expect(head.rotation.x).toBeCloseTo(0.1)
    expect(head.rotation.y).toBeCloseTo(0.2)
    expect(head.rotation.z).toBeCloseTo(0.3)

    const leftArm = bones.get('LeftArm')!
    expect(leftArm.rotation.x).toBeCloseTo(1.0)
    expect(leftArm.rotation.y).toBe(0)
    expect(leftArm.rotation.z).toBe(0)
  })

  it('should handle missing bones gracefully', () => {
    // Create a rig with only head bone
    const headBone = new THREE.Bone()
    headBone.name = 'Head'
    const minimalBones = new Map([['Head', headBone]])

    const minimalRig: CharacterRig = {
      ...rig,
      bones: minimalBones
    }

    const minimalController = new BoneController(minimalRig)

    const pose: BodyPose = {
      head: [0.1, 0, 0],
      leftArm: [1.0, 0, 0] // Bone missing in rig
    }

    // Should not throw
    expect(() => minimalController.setPose(pose)).not.toThrow()
    expect(headBone.rotation.x).toBeCloseTo(0.1)
  })

  it('should reset bones to identity rotation', () => {
    const pose: BodyPose = {
      head: [1, 1, 1],
      spine: [0.5, 0.5, 0.5]
    }

    controller.setPose(pose)
    controller.reset()

    bones.forEach(bone => {
      expect(bone.quaternion.x).toBe(0)
      expect(bone.quaternion.y).toBe(0)
      expect(bone.quaternion.z).toBe(0)
      expect(bone.quaternion.w).toBe(1)
    })
  })

  it('should map leftLeg and rightLeg to UpperLeg bones', () => {
    const pose: BodyPose = {
      leftLeg: [0.5, 0, 0],
      rightLeg: [0, 0.5, 0]
    }

    controller.setPose(pose)

    const leftLeg = bones.get('LeftUpperLeg')!
    expect(leftLeg.rotation.x).toBeCloseTo(0.5)

    const rightLeg = bones.get('RightUpperLeg')!
    expect(rightLeg.rotation.y).toBeCloseTo(0.5)
  })
})
