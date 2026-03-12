// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Humanoid } from './Humanoid';
import { CharacterActor } from '../types';

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
    useGLTF: vi.fn(() => ({ scene: { clone: () => ({ traverse: () => {} }) }, animations: [] })),
}));

// Mock controllers
vi.mock('./CharacterAnimator', () => ({
    CharacterAnimator: vi.fn().mockImplementation(function() {
        return {
            registerClip: vi.fn(),
            play: vi.fn(),
            setSpeed: vi.fn(),
            dispose: vi.fn(),
            update: vi.fn(),
        };
    }),
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
}));

describe('Humanoid', () => {
    const mockActor: CharacterActor = {
        id: 'char-1',
        name: 'Hero',
        type: 'character',
        visible: true,
        transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        animation: 'idle',
        morphTargets: {},
        bodyPose: {},
        clothing: {}
    };

    it('renders procedural humanoid by default', () => {
        const { container } = render(<Humanoid actor={mockActor} />);
        expect(container).toBeDefined();
    });

    it('renders GLB humanoid when modelUrl is provided', () => {
        const actorWithUrl = { ...mockActor, modelUrl: 'https://example.com/model.glb' };
        const { container } = render(<Humanoid actor={actorWithUrl} />);
        expect(container).toBeDefined();
    });
});
