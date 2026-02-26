// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { PropertiesPanel } from './PropertiesPanel';
import { useSceneStore, PrimitiveActor } from '@Animatica/engine';

// Mock timer functions
vi.useFakeTimers();

afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    // Reset store
    useSceneStore.setState({ actors: [], selectedActorId: null });
});

describe('PropertiesPanel', () => {
    const initialStoreState = {
        actors: [],
        selectedActorId: null,
        playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1 as 1 | -1, loopMode: 'none' as 'none' | 'loop' | 'bounce' },
        environment: { ambientLight: { intensity: 1, color: '#fff' }, sun: { position: [0, 10, 0] as [number, number, number], intensity: 1, color: '#fff' }, skyColor: '#000' },
        timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
        meta: { title: 'Test', version: '1.0.0' },
        library: { clips: [] }
    };

    beforeEach(() => {
        useSceneStore.setState(initialStoreState);
    });

    const createPrimitive = (id: string): PrimitiveActor => ({
        id,
        name: 'Test Box',
        type: 'primitive',
        visible: true,
        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0, opacity: 1, wireframe: false }
    });

    it('renders empty state when no actor is selected', () => {
        render(<PropertiesPanel selectedActorId={null} />);
        expect(screen.getByText('Properties')).toBeTruthy();
        expect(screen.getByText('Select an actor to edit its properties')).toBeTruthy();
    });

    it('renders properties for primitive actor', () => {
        const actor = createPrimitive('actor_1');
        useSceneStore.getState().addActor(actor);

        render(<PropertiesPanel selectedActorId="actor_1" />);

        expect(screen.getByDisplayValue('Test Box')).toBeTruthy();
        expect(screen.getByText('Transform')).toBeTruthy();
        expect(screen.getByText('Material')).toBeTruthy();

        // Shape selector
        const shapeSelect = screen.getByRole('combobox') as HTMLSelectElement;
        expect(shapeSelect.value).toBe('box');

        // Color input
        expect(screen.getByText('#ff0000')).toBeTruthy();
    });

    it('updates actor name with debounce', async () => {
        const actor = createPrimitive('actor_1');
        useSceneStore.getState().addActor(actor);
        render(<PropertiesPanel selectedActorId="actor_1" />);

        const nameInput = screen.getByDisplayValue('Test Box');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        // Local state updates immediately
        expect(screen.getByDisplayValue('New Name')).toBeTruthy();

        // Store not updated yet
        expect(useSceneStore.getState().actors[0].name).toBe('Test Box');

        // Advance timers
        act(() => {
            vi.advanceTimersByTime(350);
        });

        // Store updated
        expect(useSceneStore.getState().actors[0].name).toBe('New Name');
    });

    it('updates transform position with debounce', async () => {
        const actor = createPrimitive('actor_1');
        useSceneStore.getState().addActor(actor);
        render(<PropertiesPanel selectedActorId="actor_1" />);

        // Find position inputs. There are 3 for Position, 3 for Rotation, 3 for Scale.
        // First one is Position X.
        const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
        const posXInput = inputs[0];

        // Standard inputs return string value
        expect(posXInput.value).toBe('0');

        fireEvent.change(posXInput, { target: { value: '5' } });

        // Local update
        expect(posXInput.value).toBe('5');
        expect(useSceneStore.getState().actors[0].transform.position[0]).toBe(0);

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(useSceneStore.getState().actors[0].transform.position[0]).toBe(5);
    });

    it('updates primitive shape immediately (select)', async () => {
        const actor = createPrimitive('actor_1');
        useSceneStore.getState().addActor(actor);
        render(<PropertiesPanel selectedActorId="actor_1" />);

        const shapeSelect = screen.getByRole('combobox');
        fireEvent.change(shapeSelect, { target: { value: 'sphere' } });

        const updatedActor = useSceneStore.getState().actors[0] as PrimitiveActor;
        expect(updatedActor.properties.shape).toBe('sphere');
    });
});
