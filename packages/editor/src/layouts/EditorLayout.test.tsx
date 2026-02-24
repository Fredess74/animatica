// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { EditorLayout } from './EditorLayout';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock components
vi.mock('../panels/AssetLibrary', () => ({
    AssetLibrary: ({ onActorCreated }: { onActorCreated: (id: string) => void }) => (
        <div data-testid="asset-library">
            AssetLibrary
            <button onClick={() => onActorCreated('actor-1')}>Select Actor</button>
        </div>
    ),
}));
vi.mock('../panels/PropertiesPanel', () => ({
    PropertiesPanel: () => <div data-testid="properties-panel">PropertiesPanel</div>,
}));
vi.mock('../panels/TimelinePanel', () => ({
    TimelinePanel: () => <div data-testid="timeline-panel">TimelinePanel</div>,
}));
vi.mock('../modals/ScriptConsole', () => ({
    ScriptConsole: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="script-console">
            ScriptConsole <button onClick={onClose}>Close</button>
        </div>
    ),
}));
vi.mock('../modals/ExportModal', () => ({
    ExportModal: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="export-modal">
            ExportModal <button onClick={onClose}>Close</button>
        </div>
    ),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
    ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

// Mock useSceneStore
const mockSetPlayback = vi.fn();
const mockRemoveActor = vi.fn();
const mockPlayback = { isPlaying: false };

vi.mock('@Animatica/engine', () => ({
    useSceneStore: () => ({
        playback: mockPlayback,
        setPlayback: mockSetPlayback,
        removeActor: mockRemoveActor,
    }),
}));

// Mock useKeyboardShortcuts
const mockUseKeyboardShortcuts = vi.fn();
vi.mock('../hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: (handlers: any) => mockUseKeyboardShortcuts(handlers),
}));

describe('EditorLayout', () => {
    beforeEach(() => {
        mockShowToast.mockClear();
        mockSetPlayback.mockClear();
        mockRemoveActor.mockClear();
        mockUseKeyboardShortcuts.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders layout structure', () => {
        render(<EditorLayout viewport={<div data-testid="viewport">Viewport</div>} />);

        expect(screen.getByText('Animatica')).toBeTruthy();
        expect(screen.getByTestId('asset-library')).toBeTruthy();
        expect(screen.getByTestId('properties-panel')).toBeTruthy();
        expect(screen.getByTestId('timeline-panel')).toBeTruthy();
        expect(screen.getByTestId('viewport')).toBeTruthy();
    });

    it('opens Script Console', () => {
        render(<EditorLayout viewport={<div />} />);

        fireEvent.click(screen.getByText('📜 Script'));
        expect(screen.getByTestId('script-console')).toBeTruthy();

        // Close it
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('script-console')).toBeNull();
    });

    it('opens Export Modal', () => {
        render(<EditorLayout viewport={<div />} />);

        fireEvent.click(screen.getByText('🎬 Export'));
        expect(screen.getByTestId('export-modal')).toBeTruthy();

        // Close it
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('export-modal')).toBeNull();
    });

    it('registers keyboard shortcuts', () => {
        render(<EditorLayout viewport={<div />} />);
        expect(mockUseKeyboardShortcuts).toHaveBeenCalledWith(expect.objectContaining({
            onPlayPause: expect.any(Function),
            onSave: expect.any(Function),
            onUndo: expect.any(Function),
            onDelete: expect.any(Function),
            onEscape: expect.any(Function),
        }));
    });

    it('handles keyboard shortcut actions', () => {
         render(<EditorLayout viewport={<div />} />);

         // Extract handlers passed to useKeyboardShortcuts
         const handlers = mockUseKeyboardShortcuts.mock.calls[0][0];

         // Test Play/Pause
         handlers.onPlayPause();
         expect(mockSetPlayback).toHaveBeenCalledWith({ isPlaying: true });
         expect(mockShowToast).toHaveBeenCalledWith('Playing', 'info', 1500);

         // Test Save
         handlers.onSave();
         expect(mockShowToast).toHaveBeenCalledWith('Project saved successfully!', 'success');

         // Test Undo
         handlers.onUndo();
         expect(mockShowToast).toHaveBeenCalledWith('Undo not implemented yet', 'info');
    });

    it('handles selection and deletion', () => {
        render(<EditorLayout viewport={<div />} />);

        // Simulate selecting an actor via the mock button
        fireEvent.click(screen.getByText('Select Actor'));

        // Get the latest call to access updated closures
        const handlers = mockUseKeyboardShortcuts.mock.calls[mockUseKeyboardShortcuts.mock.calls.length - 1][0];

        // Test Delete
        handlers.onDelete();
        expect(mockRemoveActor).toHaveBeenCalledWith('actor-1');
        expect(mockShowToast).toHaveBeenCalledWith('Actor removed', 'info');

        // Re-select
        fireEvent.click(screen.getByText('Select Actor'));

        const handlersAfterReselect = mockUseKeyboardShortcuts.mock.calls[mockUseKeyboardShortcuts.mock.calls.length - 1][0];

        // Test Escape (Deselect)
        handlersAfterReselect.onEscape();
        expect(mockShowToast).toHaveBeenCalledWith('Actor deselected', 'info', 1000);
    });
});
