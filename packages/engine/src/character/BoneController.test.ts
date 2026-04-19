import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>
    let boneController: BoneController

    beforeEach(() => {
        bones = new Map()
        // Create dummy bones
        const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
        boneNames.forEach(name => {
            const bone = new THREE.Bone()
            bone.name = name
            bones.set(name, bone)
        })
        boneController = new BoneController(bones)
    })

    it('should apply rotations to correct bones', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            spine: [0.4, 0.5, 0.6],
            leftArm: [0.7, 0.8, 0.9],
            rightArm: [1.0, 1.1, 1.2],
            leftLeg: [1.3, 1.4, 1.5],
            rightLeg: [1.6, 1.7, 1.8],
        }

        boneController.update(pose)

        expect(bones.get('Head')?.rotation.x).toBeCloseTo(0.1)
        expect(bones.get('Spine')?.rotation.y).toBeCloseTo(0.5)
        expect(bones.get('LeftArm')?.rotation.z).toBeCloseTo(0.9)
        expect(bones.get('RightArm')?.rotation.x).toBeCloseTo(1.0)
        expect(bones.get('LeftUpperLeg')?.rotation.y).toBeCloseTo(1.4)
        expect(bones.get('RightUpperLeg')?.rotation.z).toBeCloseTo(1.8)
    })

    it('should handle missing bones gracefully', () => {
        const incompleteBones = new Map<string, THREE.Bone>()
        const headBone = new THREE.Bone()
        incompleteBones.set('Head', headBone)

        const controller = new BoneController(incompleteBones)

        const pose: BodyPose = {
            head: [0.1, 0.1, 0.1],
            spine: [0.2, 0.2, 0.2], // Missing bone
        }

        // Should not throw
        expect(() => controller.update(pose)).not.toThrow()
        expect(headBone.rotation.x).toBeCloseTo(0.1)
    })

    it('should handle undefined pose properties', () => {
        const pose: BodyPose = {
            head: [0.5, 0.5, 0.5],
            // spine is undefined
        }

        const initialSpineRotation = bones.get('Spine')?.rotation.clone()

        boneController.update(pose)

        expect(bones.get('Head')?.rotation.x).toBeCloseTo(0.5)
        expect(bones.get('Spine')?.rotation.x).toBe(initialSpineRotation?.x)
    })

    it('should handle null/undefined pose', () => {
        expect(() => boneController.update(null as any)).not.toThrow()
        expect(() => boneController.update(undefined as any)).not.toThrow()
    })
})
