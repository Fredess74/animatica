import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

describe('BoneController', () => {
    const createMockBones = () => {
        const bones = new Map<string, THREE.Bone>()
        const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
        boneNames.forEach(name => {
            const bone = new THREE.Bone()
            bone.name = name
            bones.set(name, bone)
        })
        return bones
    }

    it('maps BodyPose rotations to bones correctly', () => {
        const bones = createMockBones()
        const controller = new BoneController(bones)
        controller.setSmoothing(1000) // fast for testing

        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            spine: [0.4, 0.5, 0.6],
            leftArm: [0.7, 0.8, 0.9],
            rightArm: [1.0, 1.1, 1.2],
            leftLeg: [1.3, 1.4, 1.5],
            rightLeg: [1.6, 1.7, 1.8],
        }

        // Run update twice to ensure we reach the target (slerp)
        controller.update(pose, 1.0)
        controller.update(pose, 1.0)

        const checkBone = (name: string, expected: [number, number, number]) => {
            const bone = bones.get(name)!
            const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...expected))
            const angle = bone.quaternion.angleTo(targetQuat)
            expect(angle).toBeCloseTo(0, 5)
        }

        checkBone('Head', pose.head!)
        checkBone('Spine', pose.spine!)
        checkBone('LeftArm', pose.leftArm!)
        checkBone('RightArm', pose.rightArm!)
        checkBone('LeftUpperLeg', pose.leftLeg!)
        checkBone('RightUpperLeg', pose.rightLeg!)
    })

    it('handles missing bones gracefully', () => {
        const bones = new Map<string, THREE.Bone>() // empty
        const controller = new BoneController(bones)

        const pose: BodyPose = { head: [1, 1, 1] }

        // Should not throw
        expect(() => controller.update(pose, 0.1)).not.toThrow()
    })

    it('handles partial pose data correctly', () => {
        const bones = createMockBones()
        const controller = new BoneController(bones)
        controller.setSmoothing(1000)

        const initialQuat = bones.get('Spine')!.quaternion.clone()
        const pose: BodyPose = { head: [1, 0, 0] }

        controller.update(pose, 1.0)
        controller.update(pose, 1.0)

        // Head should change
        expect(bones.get('Head')!.quaternion.x).not.toBe(0)
        // Spine should NOT change
        expect(bones.get('Spine')!.quaternion.equals(initialQuat)).toBe(true)
    })
})
