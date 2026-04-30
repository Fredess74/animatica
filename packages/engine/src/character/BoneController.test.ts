import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { BoneController } from './BoneController';
import { BodyPose } from '../types';

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>;
    let controller: BoneController;

    beforeEach(() => {
        bones = new Map();

        const boneNames = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg'];
        boneNames.forEach(name => {
            const bone = new THREE.Bone();
            bone.name = name;
            bones.set(name, bone);
        });

        controller = new BoneController(bones);
        // Set lerp speed high to make tests near-instant (or delta=1)
        controller.setLerpSpeed(1000);
    });

    it('should apply rotation to bones based on BodyPose', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            leftArm: [1, 0, 0]
        };

        // Use a large delta to ensure it reaches target in one step due to high lerpSpeed
        controller.update(pose, 1);

        const head = bones.get('Head')!;
        const leftArm = bones.get('LeftArm')!;

        expect(head.rotation.x).toBeCloseTo(0.1);
        expect(head.rotation.y).toBeCloseTo(0.2);
        expect(head.rotation.z).toBeCloseTo(0.3);

        expect(leftArm.rotation.x).toBeCloseTo(1);
        expect(leftArm.rotation.y).toBeCloseTo(0);
        expect(leftArm.rotation.z).toBeCloseTo(0);
    });

    it('should smoothly interpolate towards target rotation', () => {
        controller.setLerpSpeed(10);
        const pose: BodyPose = {
            head: [1, 0, 0]
        };

        // Small delta, should not reach target
        controller.update(pose, 0.01);

        const head = bones.get('Head')!;
        expect(head.rotation.x).toBeGreaterThan(0);
        expect(head.rotation.x).toBeLessThan(1);
    });

    it('should handle missing bones gracefully', () => {
        const partialBones = new Map<string, THREE.Bone>();
        const headBone = new THREE.Bone();
        headBone.name = 'Head';
        partialBones.set('Head', headBone);

        const partialController = new BoneController(partialBones);
        const pose: BodyPose = {
            head: [0.5, 0.5, 0.5],
            spine: [1, 1, 1] // Bone doesn't exist in map
        };

        expect(() => partialController.update(pose, 1)).not.toThrow();
        expect(headBone.rotation.x).toBeCloseTo(0.5);
    });
});
