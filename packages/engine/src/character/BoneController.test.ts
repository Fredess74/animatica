import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { HUMANOID_BONES } from './CharacterLoader'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let controller: BoneController

  beforeEach(() => {
    bones = new Map()
    // Create bones from the official HUMANOID_BONES list
    HUMANOID_BONES.forEach((name) => {
      const bone = new THREE.Bone()
      bone.name = name
      bones.set(name, bone)
    })
    controller = new BoneController(bones)
  })

  it('should apply rotations to bones correctly', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6],
    }

    controller.update(pose)

    const headBone = bones.get('Head')!
    const spineBone = bones.get('Spine')!

    const expectedHeadEuler = new THREE.Euler(0.1, 0.2, 0.3)
    const expectedHeadQuaternion = new THREE.Quaternion().setFromEuler(expectedHeadEuler)

    const expectedSpineEuler = new THREE.Euler(0.4, 0.5, 0.6)
    const expectedSpineQuaternion = new THREE.Quaternion().setFromEuler(expectedSpineEuler)

    expect(headBone.quaternion.x).toBeCloseTo(expectedHeadQuaternion.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedHeadQuaternion.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedHeadQuaternion.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedHeadQuaternion.w)

    expect(spineBone.quaternion.x).toBeCloseTo(expectedSpineQuaternion.x)
    expect(spineBone.quaternion.y).toBeCloseTo(expectedSpineQuaternion.y)
    expect(spineBone.quaternion.z).toBeCloseTo(expectedSpineQuaternion.z)
    expect(spineBone.quaternion.w).toBeCloseTo(expectedSpineQuaternion.w)
  })

  it('should handle missing bones gracefully', () => {
    const incompleteBones = new Map<string, THREE.Bone>()
    const headBone = new THREE.Bone()
    headBone.name = 'Head'
    incompleteBones.set('Head', headBone)

    const controllerWithMissingBones = new BoneController(incompleteBones)
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6], // Spine is missing in this rig
    }

    // Should not throw
    expect(() => controllerWithMissingBones.update(pose)).not.toThrow()

    const expectedHeadEuler = new THREE.Euler(0.1, 0.2, 0.3)
    const expectedHeadQuaternion = new THREE.Quaternion().setFromEuler(expectedHeadEuler)

    expect(headBone.quaternion.x).toBeCloseTo(expectedHeadQuaternion.x)
  })

  it('should handle undefined pose properties', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
    }
    // spine, arms, legs are undefined

    controller.update(pose)

    const headBone = bones.get('Head')!
    const spineBone = bones.get('Spine')!

    expect(headBone.quaternion.x).not.toBe(0)
    expect(spineBone.quaternion.x).toBe(0) // Should remain at identity
  })
})
