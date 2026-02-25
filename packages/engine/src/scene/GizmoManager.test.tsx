/**
 * @vitest-environment jsdom
 */
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GizmoManager } from './GizmoManager';
import { useSceneStore } from '../store/sceneStore';
import { useThree } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

// Mock dependencies
vi.mock('@react-three/fiber', () => ({
    useThree: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
    TransformControls: vi.fn(({ onObjectChange }) => (
        <div
            data-testid="transform-controls"
            onClick={() => {
                 // Simulate a change event
                 const mockEvent = {
                     target: {
                         object: {
                             position: { x: 10, y: 20, z: 30 },
                             rotation: { x: 0, y: 1, z: 0 },
                             scale: { x: 2, y: 2, z: 2 },
                         }
                     }
                 };
                 onObjectChange(mockEvent);
            }}
        />
    )),
}));

vi.mock('../store/sceneStore', () => ({
    useSceneStore: vi.fn(),
}));

describe('GizmoManager', () => {
    const mockScene = {
        getObjectByName: vi.fn(),
    };
    const mockUpdateActor = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();

        // Mock useThree
        (useThree as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ scene: mockScene });

        // Mock useSceneStore
        (useSceneStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
            // Because useSceneStore is used twice (updateActor and actors),
            // we need to handle both selectors.
            // A simple way is to check the function string or just return a mock state object if it's not a function.
            // But useSceneStore(s => s.updateActor) passes a function.

            // Mock implementation: execute the selector against a mock state
            const mockState = {
                updateActor: mockUpdateActor,
                actors: [],
            };

            return selector(mockState);
        });
    });

    it('renders nothing when no actor is selected', () => {
        const { queryByTestId } = render(<GizmoManager selectedActorId={undefined} />);
        expect(queryByTestId('transform-controls')).toBeNull();
    });

    it('renders TransformControls when actor is selected and found in scene', () => {
        const mockObject = new THREE.Object3D();
        mockScene.getObjectByName.mockReturnValue(mockObject);

        const { getByTestId } = render(<GizmoManager selectedActorId="actor-1" />);
        expect(getByTestId('transform-controls')).toBeTruthy();
        expect(mockScene.getObjectByName).toHaveBeenCalledWith('actor-1');
    });

    it('calls updateActor when TransformControls changes', () => {
        const mockObject = new THREE.Object3D();
        mockScene.getObjectByName.mockReturnValue(mockObject);

        const { getByTestId } = render(<GizmoManager selectedActorId="actor-1" />);

        // Trigger the mock click which triggers onObjectChange
        getByTestId('transform-controls').click();

        expect(mockUpdateActor).toHaveBeenCalledWith('actor-1', {
            transform: {
                position: [10, 20, 30],
                rotation: [0, 1, 0],
                scale: [2, 2, 2],
            },
        });
    });
});
