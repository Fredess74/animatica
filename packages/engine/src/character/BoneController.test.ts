import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>
    let controller: BoneController
    let headBone: THREE.Bone
    let spineBone: THREE.Bone

    beforeEach(() => {
        bones = new Map()
        headBone = new THREE.Bone()
        headBone.name = 'Head'
        spineBone = new THREE.Bone()
        spineBone.name = 'Spine'

        bones.set('Head', headBone)
        bones.set('Spine', spineBone)

        controller = new BoneController(bones)
    })

    it('should initialize correctly', () => {
        expect(controller).toBeDefined()
    })

    it('should interpolate bone rotations towards target pose', () => {
        const targetPose: BodyPose = {
            head: [Math.PI / 4, 0, 0], // 45 degrees on X
        }

        controller.setPose(targetPose)

        // Initial rotation should be identity
        expect(headBone.quaternion.x).toBe(0)
        expect(headBone.quaternion.y).toBe(0)
        expect(headBone.quaternion.z).toBe(0)
        expect(headBone.quaternion.w).toBe(1)

        // Update with small delta
        controller.update(0.1)

        // Rotation should have changed
        expect(headBone.quaternion.x).toBeGreaterThan(0)

        // Update with large delta to nearly reach target
        controller.update(10.0)

        const expectedQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, 0))

        // Should be very close to target
        expect(headBone.quaternion.x).toBeCloseTo(expectedQuat.x, 5)
        expect(headBone.quaternion.y).toBeCloseTo(expectedQuat.y, 5)
        expect(headBone.quaternion.z).toBeCloseTo(expectedQuat.z, 5)
        expect(headBone.quaternion.w).toBeCloseTo(expectedQuat.w, 5)
    })

    it('should handle missing bones gracefully', () => {
        const targetPose: BodyPose = {
            leftArm: [1, 1, 1], // LeftArm is NOT in our bones map
        }

        controller.setPose(targetPose)

        // Should not throw
        expect(() => controller.update(0.1)).not.toThrow()
    })

    it('should respect lerp speed', () => {
        const targetPose: BodyPose = {
            head: [1, 0, 0],
        }

        controller.setPose(targetPose)

        // Test slow speed
        controller.setSpeed(1.0)
        controller.update(0.1)
        const slowX = headBone.quaternion.x

        // Reset
        headBone.quaternion.set(0, 0, 0, 1)

        // Test fast speed
        controller.setSpeed(100.0)
        controller.update(0.1)
        const fastX = headBone.quaternion.x

        expect(fastX).toBeGreaterThan(slowX)
    })
})
