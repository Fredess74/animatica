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
    // Fast lerp for testing final values
    controller.setLerpSpeed(1000)
  })

  it('should apply rotations to correct bones', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6],
      leftArm: [0.7, 0.8, 0.9],
    }

    controller.setTargetPose(pose)
    controller.update(0.1)

    const head = bones.get('Head')!
    const headEuler = new THREE.Euler().setFromQuaternion(head.quaternion)
    expect(headEuler.x).toBeCloseTo(0.1)
    expect(headEuler.y).toBeCloseTo(0.2)
    expect(headEuler.z).toBeCloseTo(0.3)

    const spine = bones.get('Spine')!
    const spineEuler = new THREE.Euler().setFromQuaternion(spine.quaternion)
    expect(spineEuler.x).toBeCloseTo(0.4)
    expect(spineEuler.y).toBeCloseTo(0.5)
    expect(spineEuler.z).toBeCloseTo(0.6)
  })

  it('should interpolate rotations smoothly', () => {
    controller.setLerpSpeed(1.0)
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    controller.setTargetPose(pose)

    // Halfway step
    controller.update(0.5)

    const head = bones.get('Head')!
    // Since we use slerp with step = delta * lerpSpeed = 0.5 * 1.0 = 0.5
    // It should be roughly halfway between identity and target
    expect(head.quaternion.x).toBeGreaterThan(0)
    expect(head.quaternion.x).toBeLessThan(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2, 0, 0)).x)
  })

  it('should reset to identity if pose property is missing', () => {
    // Start with a rotation
    const head = bones.get('Head')!
    head.quaternion.setFromEuler(new THREE.Euler(1, 1, 1))

    // Set empty pose
    controller.setTargetPose({})
    controller.update(1.0) // complete step

    expect(head.quaternion.x).toBeCloseTo(0)
    expect(head.quaternion.y).toBeCloseTo(0)
    expect(head.quaternion.z).toBeCloseTo(0)
    expect(head.quaternion.w).toBeCloseTo(1)
  })

  it('should handle missing bones gracefully', () => {
    const incompleteBones = new Map<string, THREE.Bone>()
    const partialController = new BoneController(incompleteBones)

    expect(() => {
      partialController.setTargetPose({ head: [1, 1, 1] })
      partialController.update(0.1)
    }).not.toThrow()
  })
})
