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

    it('updates bone rotations from pose', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            leftArm: [1, 0, 0]
        }

        controller.updatePose(pose)

        // Before update, bones should be default identity
        expect(bones.get('Head')?.quaternion.x).toBe(0)

        // Update with large delta to reach target instantly for test
        controller.update(1.0)

        const headBone = bones.get('Head')
        const expectedHead = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0.2, 0.3))

        expect(headBone?.quaternion.x).toBeCloseTo(expectedHead.x)
        expect(headBone?.quaternion.y).toBeCloseTo(expectedHead.y)
        expect(headBone?.quaternion.z).toBeCloseTo(expectedHead.z)
        expect(headBone?.quaternion.w).toBeCloseTo(expectedHead.w)

        const leftArmBone = bones.get('LeftArm')
        const expectedArm = new THREE.Quaternion().setFromEuler(new THREE.Euler(1, 0, 0))
        expect(leftArmBone?.quaternion.x).toBeCloseTo(expectedArm.x)
    })

    it('smoothly lerps towards target', () => {
        const pose: BodyPose = {
            spine: [0.5, 0, 0]
        }

        controller.updatePose(pose)

        // Small delta
        controller.update(0.016) // ~60fps

        const spineBone = bones.get('Spine')
        const target = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0))

        // Should have moved partially towards target but not reached it
        expect(spineBone?.quaternion.x).toBeGreaterThan(0)
        expect(spineBone?.quaternion.x).toBeLessThan(target.x)
    })

    it('removes target when pose key is removed', () => {
        controller.updatePose({ head: [0.1, 0, 0] })
        controller.update(1.0)

        expect(bones.get('Head')?.quaternion.x).toBeGreaterThan(0)

        // Clear pose
        controller.updatePose({})

        // No targets should remain, updating should not change anything further
        // (Note: BoneController doesn't automatically reset the bone to its original pose,
        // it just stops overriding. This is intended as animations take over.)
        const xBefore = bones.get('Head')?.quaternion.x
        controller.update(1.0)
        expect(bones.get('Head')?.quaternion.x).toBe(xBefore)
    })
})
