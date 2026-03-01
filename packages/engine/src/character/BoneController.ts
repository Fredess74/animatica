import * as THREE from 'three'
import type { BodyPose, Vector3 } from '../types'

/**
 * BoneController — Maps abstract BodyPose data to Three.js skeleton bones.
 * Handles bone discovery and smooth rotation interpolation (slerp).
 */
export class BoneController {
    private bones: Map<string, THREE.Bone> = new Map()
    private initialRotations: Map<string, THREE.Quaternion> = new Map()
    private targetRotations: Map<string, THREE.Quaternion> = new Map()
    private lerpSpeed: number = 10.0 // rad/s or blending factor

    // Static scratch objects to avoid per-frame allocations
    private static readonly _euler = new THREE.Euler()

    /**
     * @param root The root object of the character (e.g. GLTF scene or procedural rig)
     */
    constructor(root: THREE.Object3D) {
        this.discoverBones(root)
    }

    /**
     * Recursively find humanoid bones in the object hierarchy.
     */
    private discoverBones(root: THREE.Object3D): void {
        root.traverse((child) => {
            if (child instanceof THREE.Bone) {
                this.bones.set(child.name, child)
                this.initialRotations.set(child.name, child.quaternion.clone())
            }
        })
    }

    /**
     * Set the target body pose to interpolate towards.
     */
    setPose(pose: BodyPose): void {
        if (pose.head) this.setTargetRotation('Head', pose.head)
        if (pose.spine) this.setTargetRotation('Spine', pose.spine)
        if (pose.leftArm) this.setTargetRotation('LeftArm', pose.leftArm)
        if (pose.rightArm) this.setTargetRotation('RightArm', pose.rightArm)
        if (pose.leftLeg) this.setTargetRotation('LeftUpperLeg', pose.leftLeg)
        if (pose.rightLeg) this.setTargetRotation('RightUpperLeg', pose.rightLeg)
    }

    /**
     * Helper to set target quaternion from Vector3 Euler angles.
     */
    private setTargetRotation(boneName: string, rotation: Vector3): void {
        if (!this.bones.has(boneName)) return

        let q = this.targetRotations.get(boneName)
        if (!q) {
            q = new THREE.Quaternion()
            this.targetRotations.set(boneName, q)
        }

        q.setFromEuler(
            BoneController._euler.set(rotation[0], rotation[1], rotation[2])
        )
    }

    /**
     * Update bone rotations (call every frame).
     */
    update(delta: number): void {
        const alpha = Math.min(this.lerpSpeed * delta, 1.0)

        for (const [name, target] of this.targetRotations.entries()) {
            const bone = this.bones.get(name)
            if (!bone) continue

            bone.quaternion.slerp(target, alpha)
        }
    }

    /**
     * Reset all bones to their default (original) rotations.
     */
    reset(): void {
        this.targetRotations.clear()
        for (const [name, bone] of this.bones.entries()) {
            const initial = this.initialRotations.get(name)
            if (initial) {
                bone.quaternion.copy(initial)
            }
        }
    }
}
