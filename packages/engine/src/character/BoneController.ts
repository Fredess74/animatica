/**
 * BoneController — Controls individual bone rotations for skeletal posing.
 * Maps abstract BodyPose properties to specific humanoid bones and handles smooth interpolation.
 *
 * @module @animatica/engine/character
 */
import * as THREE from 'three';
import type { BodyPose } from '../types';

/**
 * Mapping between BodyPose properties and standard humanoid bone names.
 */
const BONE_MAPPING: Record<keyof BodyPose, string> = {
    head: 'Head',
    spine: 'Spine',
    leftArm: 'LeftArm',
    rightArm: 'RightArm',
    leftLeg: 'LeftUpperLeg',
    rightLeg: 'RightUpperLeg',
};

/**
 * BoneController manages the skeletal pose of a character.
 * It allows overriding specific bone rotations on top of animations.
 */
export class BoneController {
    private bones: Map<string, THREE.Bone>;
    private targetPose: BodyPose = {};
    private currentPose: BodyPose = {};
    private lerpSpeed: number = 8.0;

    /**
     * @param bones A map of bone names to THREE.Bone instances.
     */
    constructor(bones: Map<string, THREE.Bone>) {
        this.bones = bones;
    }

    /**
     * Set the target pose for the character.
     * The controller will smoothly interpolate towards this pose in the update loop.
     * @param pose The new body pose to apply.
     */
    setPose(pose: BodyPose): void {
        // Deep copy incoming pose to prevent external mutation issues
        this.targetPose = JSON.parse(JSON.stringify(pose));
    }

    /**
     * Set the pose immediately without interpolation.
     * @param pose The body pose to apply.
     */
    setImmediate(pose: BodyPose): void {
        this.targetPose = { ...pose };
        this.currentPose = JSON.parse(JSON.stringify(pose)); // Deep copy to avoid reference sharing
        this.applyPose(this.currentPose);
    }

    /**
     * Update the bone rotations based on the current target pose and delta time.
     * Should be called every frame.
     * @param delta Time elapsed since the last frame in seconds.
     */
    update(delta: number): void {
        const alpha = Math.min(delta * this.lerpSpeed, 1.0);
        let hasChanges = false;

        // Interpolate each defined pose component
        for (const key of Object.keys(BONE_MAPPING) as Array<keyof BodyPose>) {
            const target = this.targetPose[key];
            if (!target) continue;

            if (!this.currentPose[key]) {
                this.currentPose[key] = [0, 0, 0];
            }

            const current = this.currentPose[key]!;

            // Lerp each axis
            for (let i = 0; i < 3; i++) {
                const diff = target[i] - current[i];
                if (Math.abs(diff) > 0.0001) {
                    current[i] += diff * alpha;
                    hasChanges = true;
                } else {
                    current[i] = target[i];
                }
            }
        }

        if (hasChanges) {
            this.applyPose(this.currentPose);
        }
    }

    /**
     * Reset all bone overrides.
     */
    reset(): void {
        this.targetPose = {};
        this.currentPose = {};
        // Note: We don't reset bone rotations to 0 here because they might be driven by animations.
        // The controller simply stops applying overrides.
    }

    /**
     * Apply the given pose to the bones.
     */
    private applyPose(pose: BodyPose): void {
        for (const [prop, boneName] of Object.entries(BONE_MAPPING)) {
            const rotation = pose[prop as keyof BodyPose];
            if (rotation) {
                const bone = this.bones.get(boneName);
                if (bone) {
                    bone.rotation.set(rotation[0], rotation[1], rotation[2]);
                }
            }
        }
    }

    /**
     * Set the interpolation speed.
     * @param speed Units per second (default: 8.0).
     */
    setLerpSpeed(speed: number): void {
        this.lerpSpeed = speed;
    }
}
