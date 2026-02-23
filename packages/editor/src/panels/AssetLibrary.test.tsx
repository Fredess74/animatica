// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AssetLibrary } from './AssetLibrary';

afterEach(() => {
    cleanup();
});

describe('AssetLibrary', () => {
    it('renders all asset categories', () => {
        render(<AssetLibrary />);
        expect(screen.getByText('Primitives')).toBeTruthy();
        expect(screen.getByText('Lights')).toBeTruthy();
        expect(screen.getByText('Cameras')).toBeTruthy();
        expect(screen.getByText('Characters')).toBeTruthy();
    });

    it('toggles category expansion on click', () => {
        render(<AssetLibrary />);

        // Find the button that contains "Primitives" text
        const primitivesHeader = screen.getByText('Primitives').closest('button');
        const lightsHeader = screen.getByText('Lights').closest('button');

        if (!primitivesHeader || !lightsHeader) {
            throw new Error('Category headers not found');
        }

        // Primitives is expanded by default, so "Box" should be visible
        expect(screen.getByText('Box')).toBeTruthy();

        // Click to collapse Primitives
        fireEvent.click(primitivesHeader);
        // "Box" should no longer be in the document
        expect(screen.queryByText('Box')).toBeNull();

        // Click to expand Lights
        fireEvent.click(lightsHeader);
        // "Point Light" inside Lights category should appear
        expect(screen.getByText('Point Light')).toBeTruthy();
    });

    it('calls onActorCreated when an asset is clicked', () => {
        const onActorCreated = vi.fn();
        render(<AssetLibrary onActorCreated={onActorCreated} />);

        // Primitives is expanded by default. Find the "Box" button.
        const boxItem = screen.getByText('Box').closest('button');

        if (!boxItem) {
            throw new Error('Box item not found');
        }

        fireEvent.click(boxItem);

        expect(onActorCreated).toHaveBeenCalledTimes(1);
        expect(onActorCreated).toHaveBeenCalledWith(expect.stringMatching(/^actor_\d+$/));
    });
});
