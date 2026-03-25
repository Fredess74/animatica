import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { BoneController } from './BoneController';
import { createProceduralHumanoid } from './CharacterLoader';
import type { BodyPose } from '../types';

describe('BoneController', () => {
    let rig: any;
    let controller: BoneController;

    beforeEach(() => {
        rig = createProceduralHumanoid();
        controller = new BoneController(rig);
    });

    it('initializes with a rig', () => {
        expect(controller).toBeDefined();
    });

    it('smoothly rotates head based on pose', () => {
        const headBone = rig.bones.get('Head');
        const initialRotation = headBone.quaternion.clone();

        const pose: BodyPose = {
            head: [0.5, 0, 0], // rotate 0.5 radians around X
        };

        // Run update with a small delta
        controller.update(pose, 0.1);

        // Should have rotated towards the target
        expect(headBone.quaternion.x).not.toBe(initialRotation.x);
        expect(headBone.quaternion.x).toBeGreaterThan(0);
    });

    it('handles multiple bone rotations simultaneously', () => {
        const headBone = rig.bones.get('Head');
        const spineBone = rig.bones.get('Spine');
        const leftArmBone = rig.bones.get('LeftArm');

        const pose: BodyPose = {
            head: [0.1, 0, 0],
            spine: [0, 0.2, 0],
            leftArm: [0, 0, 0.3],
        };

        controller.update(pose, 1.0); // large delta for near-complete interpolation

        expect(headBone.quaternion.x).toBeGreaterThan(0);
        expect(spineBone.quaternion.y).toBeGreaterThan(0);
        expect(leftArmBone.quaternion.z).toBeGreaterThan(0);
    });

    it('handles missing bones gracefully', () => {
        // Create a rig with no Head bone
        const limitedRig = {
            bones: new Map<string, THREE.Bone>([
                ['Spine', new THREE.Bone()],
            ]),
            root: new THREE.Group(),
            bodyMesh: null,
            skeleton: null,
            morphTargetMap: {},
            animations: [],
        };

        const limitedController = new BoneController(limitedRig as any);
        const pose: BodyPose = {
            head: [1, 1, 1],
            spine: [0.5, 0, 0],
        };

        // Should not throw even though Head bone is missing
        expect(() => limitedController.update(pose, 0.1)).not.toThrow();

        const spineBone = limitedRig.bones.get('Spine')!;
        expect(spineBone.quaternion.x).toBeGreaterThan(0);
    });

    it('handles empty pose gracefully', () => {
        const headBone = rig.bones.get('Head');
        const initialRotation = headBone.quaternion.clone();

        controller.update({}, 0.1);

        expect(headBone.quaternion.equals(initialRotation)).toBe(true);
    });

    it('respects lerp speed setting', () => {
        const headBone = rig.bones.get('Head');
        const pose: BodyPose = { head: [1, 0, 0] };

        // Test with slow speed
        controller.setLerpSpeed(1.0);
        controller.update(pose, 0.1);
        const slowRotation = headBone.quaternion.x;

        // Reset and test with fast speed
        headBone.quaternion.set(0, 0, 0, 1);
        controller.setLerpSpeed(100.0);
        controller.update(pose, 0.1);
        const fastRotation = headBone.quaternion.x;

        expect(fastRotation).toBeGreaterThan(slowRotation);
    });
});
