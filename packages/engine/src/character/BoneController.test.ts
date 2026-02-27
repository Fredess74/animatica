import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { BoneController } from './BoneController';
import type { BodyPose } from '../types';

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>;
    let controller: BoneController;

    beforeEach(() => {
        bones = new Map();

        const head = new THREE.Bone();
        head.name = 'Head';
        bones.set('Head', head);

        const spine = new THREE.Bone();
        spine.name = 'Spine';
        bones.set('Spine', spine);

        const leftArm = new THREE.Bone();
        leftArm.name = 'LeftArm';
        bones.set('LeftArm', leftArm);

        controller = new BoneController(bones);
    });

    it('should apply rotations to existing bones', () => {
        const pose: BodyPose = {
            head: [0.1, 0.2, 0.3],
            spine: [0.4, 0.5, 0.6],
        };

        controller.update(pose);

        const head = controller.getBone('Head');
        expect(head?.rotation.x).toBeCloseTo(0.1);
        expect(head?.rotation.y).toBeCloseTo(0.2);
        expect(head?.rotation.z).toBeCloseTo(0.3);

        const spine = controller.getBone('Spine');
        expect(spine?.rotation.x).toBeCloseTo(0.4);
        expect(spine?.rotation.y).toBeCloseTo(0.5);
        expect(spine?.rotation.z).toBeCloseTo(0.6);
    });

    it('should ignore missing bones gracefully', () => {
        const pose: BodyPose = {
            rightArm: [1, 1, 1], // RightArm is not in our mock bones Map
        };

        // This should not throw
        expect(() => controller.update(pose)).not.toThrow();
    });

    it('should ignore undefined pose properties', () => {
        const head = controller.getBone('Head')!;
        head.rotation.set(1, 1, 1);

        const pose: BodyPose = {
            head: undefined,
        };

        controller.update(pose);

        // Rotation should remain unchanged
        expect(head.rotation.x).toBe(1);
    });

    it('should map bodyLeg to standard bone names', () => {
        const leftLeg = new THREE.Bone();
        leftLeg.name = 'LeftUpperLeg';
        bones.set('LeftUpperLeg', leftLeg);

        const pose: BodyPose = {
            leftLeg: [0.5, 0, 0],
        };

        controller.update(pose);

        expect(leftLeg.rotation.x).toBeCloseTo(0.5);
    });
});
