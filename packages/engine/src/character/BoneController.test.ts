import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { BoneController } from './BoneController'
import { BodyPose } from '../types'

describe('BoneController', () => {
    let root: THREE.Group
    let headBone: THREE.Bone
    let spineBone: THREE.Bone
    let controller: BoneController

    beforeEach(() => {
        root = new THREE.Group()
        headBone = new THREE.Bone()
        headBone.name = 'Head'
        spineBone = new THREE.Bone()
        spineBone.name = 'Spine'

        root.add(headBone)
        root.add(spineBone)

        controller = new BoneController(root)
    })

    it('discovers bones in the hierarchy', () => {
        // Accessing private bones for testing
        const bones = (controller as any).bones as Map<string, THREE.Bone>
        expect(bones.get('Head')).toBe(headBone)
        expect(bones.get('Spine')).toBe(spineBone)
    })

    it('sets target rotations from BodyPose', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            spine: [0.4, 0.5, 0.6]
        }

        controller.setPose(pose)

        const targetRotations = (controller as any).targetRotations as Map<string, THREE.Quaternion>

        const expectedHeadQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0.2, 0.3))
        const expectedSpineQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0.5, 0.6))

        expect(targetRotations.get('Head')?.x).toBeCloseTo(expectedHeadQ.x)
        expect(targetRotations.get('Spine')?.x).toBeCloseTo(expectedSpineQ.x)
    })

    it('interpolates rotations over time', () => {
        const pose: BodyPose = {
            head: [Math.PI / 2, 0, 0]
        }
        controller.setPose(pose)

        // Initial rotation should be identity [0,0,0,1]
        expect(headBone.quaternion.x).toBe(0)

        // Update with small delta
        controller.update(0.01)
        expect(headBone.quaternion.x).toBeGreaterThan(0)
        expect(headBone.quaternion.x).toBeLessThan(1)

        // Update with large delta to reach target
        controller.update(1.0)
        const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
        expect(headBone.quaternion.x).toBeCloseTo(targetQ.x)
    })

    it('resets bones to initial rotations', () => {
        // Set initial rotation
        headBone.quaternion.setFromEuler(new THREE.Euler(0.5, 0, 0))
        // Re-initialize to capture new initial state
        controller = new BoneController(root)

        const pose: BodyPose = { head: [1.0, 0, 0] }
        controller.setPose(pose)
        controller.update(1.0)

        expect(headBone.quaternion.x).not.toBeCloseTo(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).x)

        controller.reset()
        expect(headBone.quaternion.x).toBeCloseTo(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).x)
    })
})
