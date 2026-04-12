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
    });

    it('should map BodyPose to correct bones', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            spine: [0.4, 0.5, 0.6],
        };

        controller.setImmediate(pose);

        const headBone = bones.get('Head');
        const spineBone = bones.get('Spine');

        expect(headBone?.rotation.x).toBeCloseTo(0.1);
        expect(headBone?.rotation.y).toBeCloseTo(0.2);
        expect(headBone?.rotation.z).toBeCloseTo(0.3);

        expect(spineBone?.rotation.x).toBeCloseTo(0.4);
        expect(spineBone?.rotation.y).toBeCloseTo(0.5);
        expect(spineBone?.rotation.z).toBeCloseTo(0.6);
    });

    it('should interpolate towards target pose', () => {
        const pose: BodyPose = {
            leftArm: [1, 1, 1],
        };

        controller.setPose(pose);

        // Update with delta time
        // lerpSpeed is 8.0, delta is 0.05 -> alpha = 0.4
        controller.update(0.05);

        const leftArmBone = bones.get('LeftArm');
        expect(leftArmBone?.rotation.x).toBeCloseTo(0.4);
        expect(leftArmBone?.rotation.y).toBeCloseTo(0.4);
        expect(leftArmBone?.rotation.z).toBeCloseTo(0.4);

        // Update again to reach target
        controller.update(1.0);
        expect(leftArmBone?.rotation.x).toBeCloseTo(1);
    });

    it('should handle missing bones gracefully', () => {
        const incompleteBones = new Map<string, THREE.Bone>();
        const headBone = new THREE.Bone();
        headBone.name = 'Head';
        incompleteBones.set('Head', headBone);

        const partialController = new BoneController(incompleteBones);
        const pose: BodyPose = {
            head: [0.1, 0.1, 0.1],
            leftArm: [1, 1, 1], // Bone missing
        };

        expect(() => {
            partialController.setImmediate(pose);
        }).not.toThrow();

        expect(headBone.rotation.x).toBeCloseTo(0.1);
    });

    it('should reset pose overrides', () => {
        const pose: BodyPose = {
            rightLeg: [0.5, 0.5, 0.5],
        };

        controller.setImmediate(pose);
        controller.reset();

        // After reset, calling update shouldn't change anything (no targetPose)
        const rightLegBone = bones.get('RightUpperLeg');
        const initialRotation = rightLegBone?.rotation.x || 0;

        controller.setPose({ rightLeg: [1, 1, 1] });
        controller.reset();
        controller.update(0.1);

        expect(rightLegBone?.rotation.x).toBe(initialRotation);
    });
});
