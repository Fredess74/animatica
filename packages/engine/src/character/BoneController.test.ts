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

  it('should apply immediate rotations', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0, 0.1, 0],
    }

    controller.setImmediate(pose)

    const head = bones.get('Head')!
    expect(head.rotation.x).toBeCloseTo(0.1)
    expect(head.rotation.y).toBeCloseTo(0.2)
    expect(head.rotation.z).toBeCloseTo(0.3)

    const spine = bones.get('Spine')!
    expect(spine.rotation.x).toBeCloseTo(0)
    expect(spine.rotation.y).toBeCloseTo(0.1)
    expect(spine.rotation.z).toBeCloseTo(0)
  })

  it('should smoothly interpolate rotations in update', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    // Step 1: Initial state (rotation 0)
    const head = bones.get('Head')!
    expect(head.rotation.x).toBe(0)

    // Step 2: Update with delta (speed is 10, so delta 0.01 = 10% progress)
    controller.update(pose, 0.01)
    expect(head.rotation.x).toBeGreaterThan(0)
    expect(head.rotation.x).toBeLessThan(Math.PI / 2)

    // Step 3: Fast forward (large delta)
    controller.update(pose, 1.0)
    expect(head.rotation.x).toBeCloseTo(Math.PI / 2)
  })

  it('should handle missing bones gracefully', () => {
    const emptyBones = new Map<string, THREE.Bone>()
    const emptyController = new BoneController(emptyBones)

    const pose: BodyPose = {
      head: [0.1, 0.1, 0.1],
    }

    // Should not throw
    expect(() => emptyController.update(pose, 0.1)).not.toThrow()
    expect(() => emptyController.setImmediate(pose)).not.toThrow()
  })

  it('should apply all pose components', () => {
    const pose: BodyPose = {
      head: [0.1, 0, 0],
      spine: [0.2, 0, 0],
      leftArm: [0.3, 0, 0],
      rightArm: [0.4, 0, 0],
      leftLeg: [0.5, 0, 0],
      rightLeg: [0.6, 0, 0],
    }

    controller.setImmediate(pose)

    expect(bones.get('Head')!.rotation.x).toBeCloseTo(0.1)
    expect(bones.get('Spine')!.rotation.x).toBeCloseTo(0.2)
    expect(bones.get('LeftArm')!.rotation.x).toBeCloseTo(0.3)
    expect(bones.get('RightArm')!.rotation.x).toBeCloseTo(0.4)
    expect(bones.get('LeftUpperLeg')!.rotation.x).toBeCloseTo(0.5)
    expect(bones.get('RightUpperLeg')!.rotation.x).toBeCloseTo(0.6)
  })
})
