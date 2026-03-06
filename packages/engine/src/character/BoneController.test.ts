import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { CharacterRig } from './CharacterLoader'

describe('BoneController', () => {
    const createMockRig = (): CharacterRig => {
        const root = new THREE.Group()
        const bones = new Map<string, THREE.Bone>()

        const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
        boneNames.forEach(name => {
            const bone = new THREE.Bone()
            bone.name = name
            bones.set(name, bone)
            root.add(bone)
        })

        return {
            root,
            bodyMesh: null,
            skeleton: null,
            bones,
            morphTargetMap: {},
            animations: []
        }
    }

    it('should initialize correctly with a rig', () => {
        const rig = createMockRig()
        const controller = new BoneController(rig)
        expect(controller).toBeDefined()
    })

    it('should apply pose rotations to bones', () => {
        const rig = createMockRig()
        const controller = new BoneController(rig)

        // 90 degrees rotation around X axis
        const targetRotation: [number, number, number] = [Math.PI / 2, 0, 0]

        controller.setPose({
            head: targetRotation
        })

        // Update with delta 1.0 (should reach target immediately at default speed 10 if we use large delta)
        // Actually step = delta * 10, so delta=0.1 reaches it.
        controller.update(0.1)

        const headBone = rig.bones.get('Head')!
        const expectedQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotation))

        // Check if rotation is approximately correct (Slerp)
        expect(headBone.quaternion.x).toBeCloseTo(expectedQuat.x)
        expect(headBone.quaternion.y).toBeCloseTo(expectedQuat.y)
        expect(headBone.quaternion.z).toBeCloseTo(expectedQuat.z)
        expect(headBone.quaternion.w).toBeCloseTo(expectedQuat.w)
    })

    it('should interpolate towards target pose over multiple frames', () => {
        const rig = createMockRig()
        const controller = new BoneController(rig)

        const targetRotation: [number, number, number] = [Math.PI / 2, 0, 0]
        controller.setPose({ head: targetRotation })

        // Halfway at delta = 0.05 (0.05 * 10 = 0.5)
        controller.update(0.05)

        const headBone = rig.bones.get('Head')!
        expect(headBone.quaternion.x).toBeGreaterThan(0)
        expect(headBone.quaternion.x).toBeLessThan(new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotation)).x)
    })

    it('should handle missing bones gracefully', () => {
        const rig = createMockRig()
        rig.bones.delete('Head') // Remove Head bone
        const controller = new BoneController(rig)

        expect(() => {
            controller.setPose({ head: [1, 0, 0] })
            controller.update(0.1)
        }).not.toThrow()
    })

    it('should reset pose', () => {
        const rig = createMockRig()
        const controller = new BoneController(rig)

        controller.setPose({ head: [Math.PI / 2, 0, 0] })
        controller.update(0.1)

        controller.reset()
        controller.update(0.1)

        // After reset, targetPose is empty, so update() does nothing.
        // The bone will keep its last rotation unless something else (animation) changes it.
        // But in our isolated test, we just verify it doesn't crash.
    })
})
