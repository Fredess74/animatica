import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorLayout } from './EditorLayout';
import { cleanup } from '@testing-library/react';

// Cleanup after each test manually since we don't have setupFiles
afterEach(() => {
    cleanup();
});

// Mock @Animatica/engine
vi.mock('@Animatica/engine', () => ({
    useSceneStore: vi.fn(() => ({
        playback: { isPlaying: false },
        setPlayback: vi.fn(),
        removeActor: vi.fn(),
        actors: [],
        updateActor: vi.fn(),
    })),
}));

// Mock child components to isolate layout testing
vi.mock('../panels/AssetLibrary', () => ({
    AssetLibrary: () => <div data-testid="asset-library">Asset Library Content</div>
}));

vi.mock('../panels/PropertiesPanel', () => ({
    PropertiesPanel: () => <div data-testid="properties-panel">Properties Panel Content</div>
}));

vi.mock('../panels/TimelinePanel', () => ({
    TimelinePanel: () => <div data-testid="timeline-panel">Timeline Panel Content</div>
}));

// Mock Modals
vi.mock('../modals/ScriptConsole', () => ({
    ScriptConsole: () => <div data-testid="script-console">Script Console</div>
}));

vi.mock('../modals/ExportModal', () => ({
    ExportModal: () => <div data-testid="export-modal">Export Modal</div>
}));

// Mock ToastContext
vi.mock('../components/ToastContext', () => ({
    ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useToast: () => ({ showToast: vi.fn() })
}));

// Mock Keyboard Shortcuts
vi.mock('../hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: vi.fn()
}));

describe('EditorLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the main layout structure', () => {
        render(<EditorLayout viewport={<div data-testid="viewport">Viewport Content</div>} />);

        expect(screen.getByText('Animatica')).toBeDefined(); // Toolbar title
        expect(screen.getByTestId('asset-library')).toBeDefined();
        expect(screen.getByTestId('properties-panel')).toBeDefined();
        expect(screen.getByTestId('timeline-panel')).toBeDefined();
        expect(screen.getByTestId('viewport')).toBeDefined();
    });

    it('toggles left sidebar collapse', () => {
        render(<EditorLayout viewport={<div />} />);

        // Initial state: Not collapsed
        expect(screen.getByTestId('asset-library')).toBeDefined();

        // Click collapse button
        const collapseButton = screen.getByTitle('Collapse Assets');
        fireEvent.click(collapseButton);

        // Asset Library content should be removed from DOM
        expect(screen.queryByTestId('asset-library')).toBeNull();

        // Click expand button
        const expandButton = screen.getByTitle('Expand Assets');
        fireEvent.click(expandButton);

        // Asset Library content should return
        expect(screen.getByTestId('asset-library')).toBeDefined();
    });

    it('toggles right sidebar collapse', () => {
        render(<EditorLayout viewport={<div />} />);

        expect(screen.getByTestId('properties-panel')).toBeDefined();

        const collapseButton = screen.getByTitle('Collapse Properties');
        fireEvent.click(collapseButton);

        expect(screen.queryByTestId('properties-panel')).toBeNull();

        const expandButton = screen.getByTitle('Expand Properties');
        fireEvent.click(expandButton);

        expect(screen.getByTestId('properties-panel')).toBeDefined();
    });

    it('toggles timeline collapse', () => {
        render(<EditorLayout viewport={<div />} />);

        expect(screen.getByTestId('timeline-panel')).toBeDefined();

        const collapseButton = screen.getByTitle('Collapse Timeline');
        fireEvent.click(collapseButton);

        expect(screen.queryByTestId('timeline-panel')).toBeNull();

        const expandButton = screen.getByTitle('Expand Timeline');
        fireEvent.click(expandButton);

        expect(screen.getByTestId('timeline-panel')).toBeDefined();
    });

    it('handles resize interactions', () => {
        const { container } = render(<EditorLayout viewport={<div />} />);

        // Find resizers via class selector
        const leftResizer = container.querySelector('.resizer--vertical');
        expect(leftResizer).not.toBeNull();

        // Simulate drag
        // 1. Mouse Down
        fireEvent.mouseDown(leftResizer!, { clientX: 280 });

        // 2. Mouse Move (on window)
        // We simulate moving mouse to right (increasing width)
        act(() => {
            const moveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: 400,
            });
            window.dispatchEvent(moveEvent);
        });

        // 3. Mouse Up
        act(() => {
            const upEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
            });
            window.dispatchEvent(upEvent);
        });

        const sidebar = container.querySelector('.editor-sidebar--left');
        // Check inline style manually since we don't have jest-dom matchers
        expect(sidebar?.getAttribute('style')).toContain('width: 400px');
    });
});
