// @vitest-environment jsdom
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { EditorLayout } from './EditorLayout';

// Mock dependencies
vi.mock('@Animatica/engine', () => ({
    useSceneStore: vi.fn(() => ({
        playback: { isPlaying: false },
        setPlayback: vi.fn(),
        removeActor: vi.fn(),
    })),
}));

vi.mock('../panels/AssetLibrary', () => ({
    AssetLibrary: () => <div data-testid="asset-library">Asset Library</div>,
}));

vi.mock('../panels/PropertiesPanel', () => ({
    PropertiesPanel: () => <div data-testid="properties-panel">Properties Panel</div>,
}));

vi.mock('../panels/TimelinePanel', () => ({
    TimelinePanel: () => <div data-testid="timeline-panel">Timeline Panel</div>,
}));

vi.mock('../modals/ScriptConsole', () => ({
    ScriptConsole: () => <div data-testid="script-console">Script Console</div>,
}));

vi.mock('../modals/ExportModal', () => ({
    ExportModal: () => <div data-testid="export-modal">Export Modal</div>,
}));

vi.mock('../components/ToastContext', () => ({
    ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useToast: () => ({ showToast: vi.fn() }),
}));

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('EditorLayout', () => {
    it('renders the layout with all panels', () => {
        render(<EditorLayout viewport={<div data-testid="viewport">Viewport</div>} />);

        expect(screen.getByTestId('asset-library')).toBeDefined();
        expect(screen.getByTestId('properties-panel')).toBeDefined();
        expect(screen.getByTestId('timeline-panel')).toBeDefined();
        expect(screen.getByTestId('viewport')).toBeDefined();
    });

    it('toggles left sidebar visibility', () => {
        render(<EditorLayout viewport={<div>Viewport</div>} />);

        // Use getAllByTestId in case of potential duplicates in test environment
        const toggles = screen.getAllByTestId('toggle-left-sidebar');
        const toggleButton = toggles[0];
        fireEvent.click(toggleButton);

        expect(screen.getAllByTitle('Show Sidebar').length).toBeGreaterThan(0);
    });

    it('toggles right sidebar visibility', () => {
        render(<EditorLayout viewport={<div>Viewport</div>} />);
        const toggles = screen.getAllByTestId('toggle-right-sidebar');
        const toggleButton = toggles[0];
        fireEvent.click(toggleButton);
        expect(screen.getAllByTitle('Show Properties').length).toBeGreaterThan(0);
    });

    it('toggles timeline visibility', () => {
        render(<EditorLayout viewport={<div>Viewport</div>} />);
        const toggles = screen.getAllByTestId('toggle-timeline');
        const toggleButton = toggles[0];
        fireEvent.click(toggleButton);
        expect(screen.getAllByTitle('Show Timeline').length).toBeGreaterThan(0);
    });

    it('updates style on resize drag', () => {
        const { container } = render(<EditorLayout viewport={<div>Viewport</div>} />);

        // Find left resizer (first vertical one)
        const leftResizer = container.querySelector('.resizer--vertical');
        expect(leftResizer).toBeTruthy();

        if (leftResizer) {
            // Start resize at 280px
            fireEvent.mouseDown(leftResizer, { clientX: 280, preventDefault: vi.fn() });

            // Move mouse to 300px
            act(() => {
                const moveEvent = new MouseEvent('mousemove', { clientX: 300, bubbles: true });
                document.dispatchEvent(moveEvent);
            });

            // Check if style updated
            const layout = container.querySelector('.editor-layout') as HTMLElement;
            // 280 initial + (300 - 280) delta = 300
            expect(layout.style.getPropertyValue('--left-sidebar-width')).toBe('300px');

            // Stop resize
            act(() => {
                const upEvent = new MouseEvent('mouseup', { bubbles: true });
                document.dispatchEvent(upEvent);
            });
        }
    });
});
