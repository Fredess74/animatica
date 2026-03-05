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

    it('initializes with identity rotations', () => {
        const head = bones.get('Head')!
        expect(head.quaternion.x).toBe(0)
        expect(head.quaternion.y).toBe(0)
        expect(head.quaternion.z).toBe(0)
        expect(head.quaternion.w).toBe(1)
    })

    it('sets and applies a pose immediately', () => {
        const pose: BodyPose = {
            head: [Math.PI / 4, 0, 0],
            leftArm: [0, 0, Math.PI / 2]
        }

        controller.setImmediate(pose)

        const head = bones.get('Head')!
        const leftArm = bones.get('LeftArm')!

        const expectedHead = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, 0, 0))
        const expectedLeftArm = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))

        expect(head.quaternion.x).toBeCloseTo(expectedHead.x)
        expect(head.quaternion.w).toBeCloseTo(expectedHead.w)
        expect(leftArm.quaternion.z).toBeCloseTo(expectedLeftArm.z)
    })

    it('interpolates towards a target pose over multiple updates', () => {
        const pose: BodyPose = {
            spine: [0, Math.PI / 2, 0]
        }

        controller.setPose(pose)

        // After 0.05s at speed 10, alpha should be 0.5
        controller.update(0.05)

        const spine = bones.get('Spine')!

        // Should be halfway between identity and PI/2 rotation
        // Quaternions are not linear, but we expect it to have moved
        expect(spine.quaternion.y).toBeGreaterThan(0)
        expect(spine.quaternion.y).toBeLessThan(0.8) // Sin(PI/4) approx 0.707

        // Final update to reach target
        controller.update(1.0)
        const expectedSpine = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))
        expect(spine.quaternion.y).toBeCloseTo(expectedSpine.y)
    })

    it('resets to identity', () => {
        const pose: BodyPose = {
            rightArm: [1, 1, 1]
        }
        controller.setImmediate(pose)
        controller.reset()

        const rightArm = bones.get('RightArm')!
        expect(rightArm.quaternion.x).toBe(0)
        expect(rightArm.quaternion.w).toBe(1)
    })

    it('gracefully handles missing bones', () => {
        const incompleteBones = new Map()
        const head = new THREE.Bone()
        head.name = 'Head'
        incompleteBones.set('Head', head)

        const partialController = new BoneController(incompleteBones)

        // Should not throw when applying pose for missing bones
        expect(() => {
            partialController.setImmediate({
                spine: [1, 1, 1],
                head: [0.1, 0, 0]
            })
            partialController.update(0.1)
        }).not.toThrow()

        expect(head.quaternion.x).toBeGreaterThan(0)
    })
})
