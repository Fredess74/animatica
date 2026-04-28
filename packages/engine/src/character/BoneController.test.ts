import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>
    let boneController: BoneController
    let headBone: THREE.Bone
    let spineBone: THREE.Bone

    beforeEach(() => {
        headBone = new THREE.Bone()
        spineBone = new THREE.Bone()
        bones = new Map([
            ['Head', headBone],
            ['Spine', spineBone]
        ])
        boneController = new BoneController(bones)
    })

    it('applies rotation to bones', () => {
        const pose: BodyPose = {
            head: [Math.PI / 4, 0, 0]
        }

        // Initial rotation should be identity
        expect(headBone.quaternion.x).toBe(0)

        // Update with delta 1.0 to apply full step (lerpSpeed * delta = 15 * 1 = 15 > 1)
        boneController.update(pose, 1.0)

        const expected = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, 0))
        expect(headBone.quaternion.x).toBeCloseTo(expected.x)
        expect(headBone.quaternion.w).toBeCloseTo(expected.w)
    })

    it('interpolates rotations over time', () => {
        const pose: BodyPose = {
            head: [Math.PI / 2, 0, 0]
        }

        // Small delta to check interpolation
        // lerpSpeed = 15.0, delta = 0.01 => step = 0.15
        boneController.update(pose, 0.01)

        expect(headBone.quaternion.x).toBeGreaterThan(0)
        expect(headBone.quaternion.x).toBeLessThan(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)).x)
    })

    it('handles missing bones gracefully', () => {
        const pose: BodyPose = {
            leftArm: [1, 1, 1] // LeftArm not in the bones map
        }

        expect(() => boneController.update(pose, 0.1)).not.toThrow()
    })

    it('does nothing if pose is undefined', () => {
        const initialQuat = headBone.quaternion.clone()
        boneController.update(undefined, 0.1)
        expect(headBone.quaternion.equals(initialQuat)).toBe(true)
    })
})
