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
    })

    it('should apply rotation to specified bones', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            leftArm: [Math.PI / 2, 0, 0]
        }

        controller.setPose(pose)

        const headBone = bones.get('Head')!
        const leftArmBone = bones.get('LeftArm')!

        // Check head rotation
        const headEuler = new THREE.Euler().setFromQuaternion(headBone.quaternion)
        expect(headEuler.x).toBeCloseTo(0.1)
        expect(headEuler.y).toBeCloseTo(0.2)
        expect(headEuler.z).toBeCloseTo(0.3)

        // Check left arm rotation
        const armEuler = new THREE.Euler().setFromQuaternion(leftArmBone.quaternion)
        expect(armEuler.x).toBeCloseTo(Math.PI / 2)
        expect(armEuler.y).toBeCloseTo(0)
        expect(armEuler.z).toBeCloseTo(0)
    })

    it('should ignore missing bones gracefully', () => {
        const partialBones = new Map<string, THREE.Bone>()
        const headBone = new THREE.Bone()
        headBone.name = 'Head'
        partialBones.set('Head', headBone)

        const partialController = new BoneController(partialBones)

        const pose: BodyPose = {
            head: [0.1, 0, 0],
            spine: [0.5, 0.5, 0.5] // Spine bone doesn't exist in partialBones
        }

        // Should not throw
        expect(() => partialController.setPose(pose)).not.toThrow()

        const headEuler = new THREE.Euler().setFromQuaternion(headBone.quaternion)
        expect(headEuler.x).toBeCloseTo(0.1)
    })

    it('should reset bone rotations to identity', () => {
        const pose: BodyPose = {
            head: [1, 1, 1],
            spine: [1, 1, 1]
        }
        controller.setPose(pose)

        controller.reset()

        bones.forEach(bone => {
            expect(bone.quaternion.x).toBe(0)
            expect(bone.quaternion.y).toBe(0)
            expect(bone.quaternion.z).toBe(0)
            expect(bone.quaternion.w).toBe(1)
        })
    })

    it('should handle undefined or null pose', () => {
        expect(() => controller.setPose(null as any)).not.toThrow()
        expect(() => controller.setPose(undefined as any)).not.toThrow()
    })
})
