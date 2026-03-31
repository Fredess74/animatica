import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
  let bones: Map<string, THREE.Bone>
  let controller: BoneController

  beforeEach(() => {
    bones = new Map()
    // Create necessary bones for testing
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

  it('maps all pose fields to correct bones', () => {
    const pose: BodyPose = {
      head: [0.1, 0.2, 0.3],
      spine: [0.2, 0.3, 0.4],
      leftArm: [0.3, 0.4, 0.5],
      rightArm: [0.4, 0.5, 0.6],
      leftLeg: [0.5, 0.6, 0.7],
      rightLeg: [0.6, 0.7, 0.8],
    }

    // Set smoothing to 1 for immediate results in tests
    controller.setSmoothing(1.0)
    controller.update(pose, 1 / 60)

    const expectedRots: Record<string, [number, number, number]> = {
      Head: [0.1, 0.2, 0.3],
      Spine: [0.2, 0.3, 0.4],
      LeftArm: [0.3, 0.4, 0.5],
      RightArm: [0.4, 0.5, 0.6],
      LeftUpperLeg: [0.5, 0.6, 0.7],
      RightUpperLeg: [0.6, 0.7, 0.8],
    }

    Object.entries(expectedRots).forEach(([name, rot]) => {
      const bone = bones.get(name)!
      const euler = new THREE.Euler().setFromQuaternion(bone.quaternion)
      // Normalize euler angles to handle periodicity and different solutions
      const normalizeAngle = (a: number) => {
        let res = a % (Math.PI * 2)
        if (res > Math.PI) res -= Math.PI * 2
        if (res < -Math.PI) res += Math.PI * 2
        return res
      }
      expect(normalizeAngle(euler.x)).toBeCloseTo(normalizeAngle(rot[0]))
      expect(normalizeAngle(euler.y)).toBeCloseTo(normalizeAngle(rot[1]))
      expect(normalizeAngle(euler.z)).toBeCloseTo(normalizeAngle(rot[2]))
    })
  })

  it('applies smooth interpolation over time', () => {
    const pose: BodyPose = {
      head: [Math.PI / 2, 0, 0],
    }

    // Default smoothing alpha = 0.15
    // Delta = 1/60s means alpha = 1 - (1 - 0.15)^(1) = 0.15
    controller.update(pose, 1 / 60)

    const head = bones.get('Head')!
    const euler = new THREE.Euler().setFromQuaternion(head.quaternion)

    // After 1 frame, we shouldn't be at the target yet
    expect(euler.x).toBeGreaterThan(0)
    expect(euler.x).toBeLessThan(Math.PI / 2)
    // Roughly 0.15 * (PI / 2) ≈ 0.235
    expect(euler.x).toBeCloseTo((Math.PI / 2) * 0.15, 2)
  })

  it('handles missing bones gracefully', () => {
    // Empty bones map
    const emptyController = new BoneController(new Map())
    const pose: BodyPose = { head: [1, 1, 1] }

    // Should not throw
    expect(() => emptyController.update(pose, 1 / 60)).not.toThrow()
  })

  it('resets bones to identity', () => {
    const head = bones.get('Head')!
    head.quaternion.set(1, 0, 0, 1).normalize()

    controller.reset()

    expect(head.quaternion.x).toBe(0)
    expect(head.quaternion.y).toBe(0)
    expect(head.quaternion.z).toBe(0)
    expect(head.quaternion.w).toBe(1)
  })
})
