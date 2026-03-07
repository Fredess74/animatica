// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import { Humanoid } from './Humanoid';
import * as THREE from 'three';

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
    useGLTF: vi.fn(),
}));

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}));

// Mock CharacterAnimator to avoid complex Three.js logic
vi.mock('./CharacterAnimator', () => {
    return {
        CharacterAnimator: vi.fn().mockImplementation(function() {
            return {
                registerClip: vi.fn(),
                play: vi.fn(),
                setSpeed: vi.fn(),
                update: vi.fn(),
                dispose: vi.fn(),
            };
        }),
        createIdleClip: vi.fn(() => ({ name: 'idle' })),
        createWalkClip: vi.fn(() => ({ name: 'walk' })),
    };
});

describe('Humanoid', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders procedural fallback when no modelUrl is provided', async () => {
        const onRigLoaded = vi.fn();
        let container: HTMLElement;

        await act(async () => {
            const result = render(
                <Humanoid onRigLoaded={onRigLoaded} skinColor="#ff0000" height={1.2} />
            );
            container = result.container;
        });

        expect(container!).toBeDefined();
        expect(onRigLoaded).toHaveBeenCalled();

        const rig = onRigLoaded.mock.calls[0][0];
        expect(rig.root).toBeInstanceOf(THREE.Group);
        // Should have bones in procedural mode
        expect(rig.bones.size).toBeGreaterThan(0);
    });

    it('attempts to load GLB when modelUrl is provided', async () => {
        const { useGLTF } = await import('@react-three/drei');
        const mockScene = new THREE.Group();
        const mockAnimations: THREE.AnimationClip[] = [];
        (useGLTF as any).mockReturnValue({ scene: mockScene, animations: mockAnimations });

        const onRigLoaded = vi.fn();

        await act(async () => {
            render(
                <React.Suspense fallback={<span>Loading...</span>}>
                    <Humanoid modelUrl="https://example.com/model.glb" onRigLoaded={onRigLoaded} />
                </React.Suspense>
            );
        });

        expect(useGLTF).toHaveBeenCalledWith('https://example.com/model.glb');
    });

    it('passes custom height and skinColor to procedural rig', async () => {
        const onRigLoaded = vi.fn();
        await act(async () => {
            render(
                <Humanoid skinColor="#00ff00" height={2.0} onRigLoaded={onRigLoaded} />
            );
        });

        const rig = onRigLoaded.mock.calls[0][0];
        // In CharacterLoader, procedural height 2.0 would mean Hips at h * 0.55 = 1.1
        const hips = rig.bones.get('Hips');
        expect(hips?.position.y).toBeCloseTo(1.1);
    });
});
