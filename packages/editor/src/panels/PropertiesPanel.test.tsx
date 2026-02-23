// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PropertiesPanel } from './PropertiesPanel';

afterEach(() => {
    cleanup();
});

describe('PropertiesPanel', () => {
    it('renders empty state when no actor is selected', () => {
        render(<PropertiesPanel selectedActorId={null} />);
        expect(screen.getByText('Properties')).toBeTruthy();
        expect(screen.getByText('Select an actor to edit its properties')).toBeTruthy();
        // Should not show property sections
        expect(screen.queryByText('Transform')).toBeNull();
    });

    it('renders properties when an actor is selected', () => {
        render(<PropertiesPanel selectedActorId="actor_1" />);
        expect(screen.getByText('Transform')).toBeTruthy();
        expect(screen.getByText('Material')).toBeTruthy();

        // Verify input labels exist
        expect(screen.getByText('Position')).toBeTruthy();
        expect(screen.getByText('Rotation')).toBeTruthy();
        expect(screen.getByText('Scale')).toBeTruthy();
        expect(screen.getByText('Color')).toBeTruthy();

        // Check for presence of inputs.
        // Since the component uses standard <input type="number">, we can query by role.
        // Vector3Input renders 3 inputs each. Position + Rotation + Scale = 9 inputs.
        const numberInputs = screen.getAllByRole('spinbutton');
        expect(numberInputs.length).toBeGreaterThanOrEqual(9);

        // Check for slider inputs (range)
        const rangeInputs = screen.getAllByRole('slider');
        // Roughness, Metalness, Opacity = 3 sliders
        expect(rangeInputs.length).toBeGreaterThanOrEqual(3);
    });
});
