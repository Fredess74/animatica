import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  const createMockBones = () => {
    const bones = new Map<string, THREE.Bone>()
    const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
    boneNames.forEach(name => {
      const bone = new THREE.Bone()
      bone.name = name
      bones.set(name, bone)
    })
    return bones
  }

  it('applies rotation to bones from pose', () => {
    const bones = createMockBones()
    const controller = new BoneController(bones)

    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      leftArm: [1.0, 0, 0]
    }

    controller.setPose(pose)

    const head = bones.get('Head')!
    expect(head.rotation.x).toBe(0.1)
    expect(head.rotation.y).toBe(0.2)
    expect(head.rotation.z).toBe(0.3)

    const leftArm = bones.get('LeftArm')!
    expect(leftArm.rotation.x).toBe(1.0)
    expect(leftArm.rotation.y).toBe(0)
    expect(leftArm.rotation.z).toBe(0)
  })

  it('resets bones to zero rotation', () => {
    const bones = createMockBones()
    const controller = new BoneController(bones)

    // Set some rotations first
    bones.get('Head')!.rotation.set(1, 1, 1)

    controller.reset()

    expect(bones.get('Head')!.rotation.x).toBe(0)
    expect(bones.get('Head')!.rotation.y).toBe(0)
    expect(bones.get('Head')!.rotation.z).toBe(0)
  })
})
