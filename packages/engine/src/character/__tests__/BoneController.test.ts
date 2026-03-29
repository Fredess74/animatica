import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { BoneController } from '../BoneController';
import { BodyPose } from '../../types';

describe('BoneController', () => {
    let bones: Map<string, THREE.Bone>;
    let controller: BoneController;

    beforeEach(() => {
        bones = new Map();
        const names = ['Head', 'Spine', 'LeftArm', 'RightArm', 'LeftUpperLeg', 'RightUpperLeg'];
        names.forEach(name => {
            const bone = new THREE.Bone();
            bone.name = name;
            bones.set(name, bone);
        });
        controller = new BoneController(bones);
        controller.setSmoothing(1.0); // No smoothing for immediate tests
    });

    it('should initialize with current rotations', () => {
        expect(bones.get('Head')?.quaternion.w).toBe(1);
    });

    it('should map pose to bone rotations', () => {
        const pose: BodyPose = {
            head: [0.5, 0, 0],
            spine: [0, 0.2, 0],
        };

        controller.setPose(pose);
        controller.update(0.016); // 1 frame at 60fps

        // Convert expected Euler to Quaternion for comparison
        const expectedHead = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0));
        const actualHead = bones.get('Head')?.quaternion;

        expect(actualHead?.x).toBeCloseTo(expectedHead.x);
        expect(actualHead?.y).toBeCloseTo(expectedHead.y);
        expect(actualHead?.z).toBeCloseTo(expectedHead.z);
        expect(actualHead?.w).toBeCloseTo(expectedHead.w);
    });

    it('should apply smoothing (slerp) over multiple frames', () => {
        controller.setSmoothing(0.5); // 50% per frame at 60fps
        const pose: BodyPose = { head: [1.0, 0, 0] };
        controller.setPose(pose);

        // Frame 1
        controller.update(0.016);
        const q1 = bones.get('Head')?.quaternion.clone();
        expect(q1?.x).toBeGreaterThan(0);
        expect(q1?.w).toBeLessThan(1.0);

        // Frame 2
        controller.update(0.016);
        const q2 = bones.get('Head')?.quaternion.clone();
        expect(q2?.x).toBeGreaterThan(q1!.x);
    });

    it('should reset rotations to identity', () => {
        controller.setPose({ head: [1.0, 0, 0] });
        controller.update(0.016);
        expect(bones.get('Head')?.quaternion.w).toBeLessThan(1.0);

        controller.reset();
        expect(bones.get('Head')?.quaternion.x).toBe(0);
        expect(bones.get('Head')?.quaternion.y).toBe(0);
        expect(bones.get('Head')?.quaternion.z).toBe(0);
        expect(bones.get('Head')?.quaternion.w).toBe(1);
    });
});
