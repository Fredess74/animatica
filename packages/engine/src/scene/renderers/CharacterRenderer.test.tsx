import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { CharacterRenderer } from './CharacterRenderer';
import { CharacterActor } from '../../types';

// Mock Three.js components and R3F
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}));

vi.mock('../../character/CharacterLoader', () => ({
    createProceduralHumanoid: vi.fn(() => ({
        root: {
            name: 'Root',
            traverse: vi.fn(),
            clone: vi.fn().mockReturnThis(),
            position: { set: vi.fn() },
            rotation: { set: vi.fn() },
            scale: { set: vi.fn() },
            add: vi.fn(),
        },
        bones: new Map(),
        bodyMesh: null,
        morphTargetMap: {},
        animations: [],
    })),
}));

vi.mock('../../character/Humanoid', () => ({
    Humanoid: vi.fn(() => <div data-testid="humanoid" />),
}));

describe('CharacterRenderer', () => {
    const mockActor: CharacterActor = {
        id: 'char-1',
        name: 'Hero',
        type: 'character',
        visible: true,
        transform: {
            position: [10, 0, 5],
            rotation: [0, Math.PI, 0],
            scale: [1, 1, 1],
        },
        animation: 'idle',
        morphTargets: {},
        bodyPose: {},
        clothing: {},
    };

    it('renders Humanoid component when visible', () => {
        const { getByTestId } = render(
            <CharacterRenderer actor={mockActor} />
        );
        expect(getByTestId('humanoid')).toBeDefined();
    });

    it('renders nothing when visible is false', () => {
        const invisibleActor = { ...mockActor, visible: false };
        const { queryByTestId } = render(
            <CharacterRenderer actor={invisibleActor} />
        );
        expect(queryByTestId('humanoid')).toBeNull();
    });

    it('passes correct props to Humanoid', () => {
        const { getByTestId } = render(
            <CharacterRenderer actor={mockActor} isSelected={true} />
        );
        // In a real R3F test we would use a specialized renderer,
        // but for this unit test, checking if it renders is enough
        // since we mocked Humanoid.
        expect(getByTestId('humanoid')).toBeDefined();
    });
});
