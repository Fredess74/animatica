import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>
    let boneController: BoneController
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

        boneController = new BoneController(bones, 10.0)
    })

    it('should apply rotation to bones based on pose', () => {
        const pose: BodyPose = {
            head: [Math.PI / 2, 0, 0],
            spine: [0, Math.PI / 4, 0]
        }

        // Run update multiple times to simulate smoothing over time
        // or just check that it's moving towards the target
        boneController.update(pose, 1.0) // Large delta to move significantly

        expect(headBone.quaternion.x).toBeGreaterThan(0)
        expect(spineBone.quaternion.y).toBeGreaterThan(0)
    })

    it('should handle missing bones gracefully', () => {
        const pose: BodyPose = {
            leftArm: [1, 1, 1] // Bone not in map
        }

        expect(() => boneController.update(pose, 0.016)).not.toThrow()
    })

    it('should handle undefined pose values', () => {
        const pose: BodyPose = {
            head: undefined
        }

        const initialQuat = headBone.quaternion.clone()
        boneController.update(pose, 0.016)
        expect(headBone.quaternion.equals(initialQuat)).toBe(true)
    })

    it('should respect smoothing speed', () => {
        const pose: BodyPose = {
            head: [Math.PI / 2, 0, 0]
        }

        // Slow speed
        boneController.setSpeed(1.0)
        boneController.update(pose, 0.1)
        const slowVal = headBone.quaternion.x

        // Reset
        headBone.quaternion.set(0, 0, 0, 1)

        // Fast speed
        boneController.setSpeed(100.0)
        boneController.update(pose, 0.1)
        const fastVal = headBone.quaternion.x

        expect(fastVal).toBeGreaterThan(slowVal)
    })

    it('should reach target rotation eventually', () => {
        const targetRotation: [number, number, number] = [Math.PI / 4, 0, 0]
        const pose: BodyPose = { head: targetRotation }

        // Simulate many frames
        for (let i = 0; i < 100; i++) {
            boneController.update(pose, 0.1)
        }

        const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotation))

        expect(headBone.quaternion.x).toBeCloseTo(targetQuat.x, 5)
        expect(headBone.quaternion.y).toBeCloseTo(targetQuat.y, 5)
        expect(headBone.quaternion.z).toBeCloseTo(targetQuat.z, 5)
        expect(headBone.quaternion.w).toBeCloseTo(targetQuat.w, 5)
    })
})
