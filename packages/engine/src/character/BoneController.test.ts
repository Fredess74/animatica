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

    it('should apply rotation to the head bone', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3]
        }
        controller.applyPose(pose)
        const headBone = bones.get('Head')!
        expect(headBone.rotation.x).toBeCloseTo(0.1)
        expect(headBone.rotation.y).toBeCloseTo(0.2)
        expect(headBone.rotation.z).toBeCloseTo(0.3)
    })

    it('should apply rotation to all supported bones', () => {
        const pose: BodyPose = {
            head: [0.1, 0, 0],
            spine: [0, 0.2, 0],
            leftArm: [0, 0, 0.3],
            rightArm: [0.4, 0.4, 0.4],
            leftLeg: [0.5, 0.5, 0.5],
            rightLeg: [0.6, 0.6, 0.6]
        }
        controller.applyPose(pose)

        expect(bones.get('Head')!.rotation.x).toBeCloseTo(0.1)
        expect(bones.get('Spine')!.rotation.y).toBeCloseTo(0.2)
        expect(bones.get('LeftArm')!.rotation.z).toBeCloseTo(0.3)
        expect(bones.get('RightArm')!.rotation.x).toBeCloseTo(0.4)
        expect(bones.get('LeftUpperLeg')!.rotation.x).toBeCloseTo(0.5)
        expect(bones.get('RightUpperLeg')!.rotation.x).toBeCloseTo(0.6)
    })

    it('should skip bones that are not in the map', () => {
        const customBones = new Map<string, THREE.Bone>()
        const headBone = new THREE.Bone()
        headBone.name = 'Head'
        customBones.set('Head', headBone)

        const customController = new BoneController(customBones)
        const pose: BodyPose = {
            head: [0.1, 0.1, 0.1],
            spine: [0.2, 0.2, 0.2] // Spine is missing from map
        }

        customController.applyPose(pose)
        expect(headBone.rotation.x).toBeCloseTo(0.1)
        // No crash should occur for missing Spine
    })

    it('should handle undefined pose or properties gracefully', () => {
        expect(() => controller.applyPose(undefined as any)).not.toThrow()
        expect(() => controller.applyPose({})).not.toThrow()
    })
})
