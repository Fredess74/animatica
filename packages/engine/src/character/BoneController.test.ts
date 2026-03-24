import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let boneMap: Map<string, THREE.Bone>
  let headBone: THREE.Bone
  let spineBone: THREE.Bone
  let controller: BoneController

  beforeEach(() => {
    boneMap = new Map()
    headBone = new THREE.Bone()
    headBone.name = 'Head'
    spineBone = new THREE.Bone()
    spineBone.name = 'Spine'

    boneMap.set('Head', headBone)
    boneMap.set('Spine', spineBone)

    controller = new BoneController(boneMap)
  })

  it('applies rotation correctly to bones', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.4, 0.5, 0.6],
    }

    // Call update with a large delta to simulate immediate jump
    controller.update(pose, 10.0)

    const expectedHeadEuler = new THREE.Euler(0.1, 0.2, 0.3)
    const expectedHeadQuat = new THREE.Quaternion().setFromEuler(expectedHeadEuler)

    // Check with precision
    expect(headBone.quaternion.x).toBeCloseTo(expectedHeadQuat.x)
    expect(headBone.quaternion.y).toBeCloseTo(expectedHeadQuat.y)
    expect(headBone.quaternion.z).toBeCloseTo(expectedHeadQuat.z)
    expect(headBone.quaternion.w).toBeCloseTo(expectedHeadQuat.w)
  })

  it('interpolates rotations over multiple frames', () => {
    const pose: BodyPose = {
      head: [1.0, 0, 0],
    }

    // Initial rotation is 0,0,0,1
    expect(headBone.quaternion.x).toBe(0)

    // Update with small delta
    controller.update(pose, 0.01)

    // Should have moved towards target but not reached it
    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(headBone.quaternion.x).toBeLessThan(0.479) // sin(1.0/2) approx 0.479

    // Update more
    controller.update(pose, 1.0)
    expect(headBone.quaternion.x).toBeCloseTo(0.479, 2)
  })

  it('handles missing/partial pose data gracefully', () => {
    const pose: BodyPose = {
      head: [1.0, 0, 0],
      // spine is missing
    }

    controller.update(pose, 10.0)

    expect(headBone.quaternion.x).toBeGreaterThan(0)
    expect(spineBone.quaternion.x).toBe(0) // Unaffected
  })

  it('handles empty pose object gracefully', () => {
    expect(() => controller.update({} as BodyPose, 0.01)).not.toThrow()
  })
})
