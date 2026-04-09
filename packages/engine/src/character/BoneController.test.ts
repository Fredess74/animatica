import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { BoneController } from './BoneController';
import type { BodyPose } from '../types';

describe('BoneController', () => {
    let boneMap: Map<string, THREE.Bone>;
    let headBone: THREE.Bone;
    let spineBone: THREE.Bone;
    let boneController: BoneController;

    beforeEach(() => {
        boneMap = new Map();
        headBone = new THREE.Bone();
        headBone.name = 'Head';
        spineBone = new THREE.Bone();
        spineBone.name = 'Spine';

        boneMap.set('Head', headBone);
        boneMap.set('Spine', spineBone);

        boneController = new BoneController(boneMap);
    });

    it('initializes with provided bones', () => {
        expect(boneController).toBeDefined();
    });

    it('updates bone rotations when pose is set and update is called', () => {
        const pose: BodyPose = {
            head: [Math.PI / 4, 0, 0],
            spine: [0, Math.PI / 4, 0],
        };

        boneController.setPose(pose);

        // Before update, bones should still be at default rotation
        expect(headBone.quaternion.x).toBe(0);

        // Update with a large delta to ensure it reaches the target (or close to it)
        boneController.update(1.0);

        expect(headBone.quaternion.x).toBeGreaterThan(0);
        expect(spineBone.quaternion.y).toBeGreaterThan(0);
    });

    it('snaps to target rotation immediately', () => {
        const pose: BodyPose = {
            head: [Math.PI / 2, 0, 0],
        };

        boneController.setPose(pose);
        boneController.snap();

        const expectedQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

        expect(headBone.quaternion.x).toBeCloseTo(expectedQuaternion.x);
        expect(headBone.quaternion.y).toBeCloseTo(expectedQuaternion.y);
        expect(headBone.quaternion.z).toBeCloseTo(expectedQuaternion.z);
        expect(headBone.quaternion.w).toBeCloseTo(expectedQuaternion.w);
    });

    it('smoothly interpolates over multiple updates', () => {
        const pose: BodyPose = {
            head: [Math.PI / 2, 0, 0],
        };

        boneController.setPose(pose);

        // Update with small delta
        boneController.update(0.01);
        const firstUpdateX = headBone.quaternion.x;
        expect(firstUpdateX).toBeGreaterThan(0);

        // Update again
        boneController.update(0.01);
        expect(headBone.quaternion.x).toBeGreaterThan(firstUpdateX);
    });
});
