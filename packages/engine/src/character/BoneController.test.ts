import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import type { BodyPose } from '../types'

describe('BoneController', () => {
    const createMockBones = () => {
        const bones = new Map<string, THREE.Bone>()
        const names = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg']
        names.forEach(name => {
            const bone = new THREE.Bone()
            bone.name = name
            bones.set(name, bone)
        })
        return bones
    }

    it('applies rotation to bones from a complete pose', () => {
        const bones = createMockBones()
        const controller = new BoneController(bones)
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            spine: [0.4, 0.5, 0.6],
            leftArm: [0.7, 0.8, 0.9],
            rightArm: [1.0, 1.1, 1.2],
            leftLeg: [1.3, 1.4, 1.5],
            rightLeg: [1.6, 1.7, 1.8]
        }

        controller.updatePose(pose)

        expect(bones.get('Head')?.rotation.toArray().slice(0, 3)).toEqual([0.1, 0.2, 0.3])
        expect(bones.get('Spine')?.rotation.toArray().slice(0, 3)).toEqual([0.4, 0.5, 0.6])
        expect(bones.get('LeftArm')?.rotation.toArray().slice(0, 3)).toEqual([0.7, 0.8, 0.9])
        expect(bones.get('RightArm')?.rotation.toArray().slice(0, 3)).toEqual([1.0, 1.1, 1.2])
        expect(bones.get('LeftUpperLeg')?.rotation.toArray().slice(0, 3)).toEqual([1.3, 1.4, 1.5])
        expect(bones.get('RightUpperLeg')?.rotation.toArray().slice(0, 3)).toEqual([1.6, 1.7, 1.8])
    })

    it('applies rotation to bones from a partial pose', () => {
        const bones = createMockBones()
        const controller = new BoneController(bones)
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            leftArm: [0.7, 0.8, 0.9]
        }

        controller.updatePose(pose)

        expect(bones.get('Head')?.rotation.toArray().slice(0, 3)).toEqual([0.1, 0.2, 0.3])
        expect(bones.get('LeftArm')?.rotation.toArray().slice(0, 3)).toEqual([0.7, 0.8, 0.9])
        // Others should remain at default (0,0,0)
        expect(bones.get('Spine')?.rotation.toArray().slice(0, 3)).toEqual([0, 0, 0])
    })

    it('does nothing when pose is undefined', () => {
        const bones = createMockBones()
        const controller = new BoneController(bones)

        expect(() => controller.updatePose(undefined)).not.toThrow()
    })

    it('gracefully handles missing bones', () => {
        const bones = new Map<string, THREE.Bone>() // No bones
        const controller = new BoneController(bones)
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3]
        }

        expect(() => controller.updatePose(pose)).not.toThrow()
    })
})
