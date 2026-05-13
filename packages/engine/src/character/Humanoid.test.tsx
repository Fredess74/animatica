/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Humanoid } from './Humanoid';

// Mock react to bypass hooks checks if needed, but render() should handle it
vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        // We need to keep Suspense working as intended or mock it if it's problematic
    };
});

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
    useGLTF: vi.fn(() => ({
        scene: {
            clone: () => ({
                traverse: vi.fn(),
            }),
        },
        animations: [],
    })),
}));

// Mock CharacterLoader
vi.mock('./CharacterLoader', () => ({
    extractRig: vi.fn((scene) => ({
        root: scene,
        bodyMesh: null,
        skeleton: null,
        bones: new Map(),
        morphTargetMap: {},
        animations: [],
    })),
}));

describe('Humanoid', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders without crashing when url is missing (fallback)', () => {
        const { container } = render(<Humanoid url="" />);
        expect(container).toBeDefined();
    });

    it('renders without crashing when url is provided', () => {
        const { container } = render(<Humanoid url="test.glb" />);
        expect(container).toBeDefined();
    });
});
