// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { EditorLayout } from './EditorLayout';
import * as ToastContext from '../components/ToastContext';
import { useSceneStore } from '@Animatica/engine';

// Mock child components
vi.mock('../panels/AssetLibrary', () => ({
    AssetLibrary: ({ onActorCreated }: any) => (
        <div data-testid="asset-library">
            Asset Library
            <button onClick={() => onActorCreated('test-actor')}>Create Actor</button>
        </div>
    ),
}));
vi.mock('../panels/PropertiesPanel', () => ({
    PropertiesPanel: ({ selectedActorId }: any) => (
        <div data-testid="properties-panel">Properties: {selectedActorId || 'None'}</div>
    ),
}));
vi.mock('../panels/TimelinePanel', () => ({
    TimelinePanel: ({ selectedActorId }: any) => (
        <div data-testid="timeline-panel">Timeline: {selectedActorId || 'None'}</div>
    ),
}));
vi.mock('../modals/ScriptConsole', () => ({
    ScriptConsole: ({ onClose }: any) => (
        <div data-testid="script-console">
            Script Console
            <button onClick={onClose}>Close Script</button>
        </div>
    ),
}));
vi.mock('../modals/ExportModal', () => ({
    ExportModal: ({ onClose }: any) => (
        <div data-testid="export-modal">
            Export Modal
            <button onClick={onClose}>Close Export</button>
        </div>
    ),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
    ToastProvider: ({ children }: any) => <div>{children}</div>,
    useToast: () => ({ showToast: mockShowToast }),
}));

// Mock useSceneStore
const mockSetPlayback = vi.fn();
const mockRemoveActor = vi.fn();

vi.mock('@Animatica/engine', () => ({
    useSceneStore: vi.fn(),
}));

// Mock useKeyboardShortcuts
// We can spy on it or just let it run. Let's let it run to test integration if possible,
// but since we are mocking useSceneStore, we need to make sure the handlers work.
// Actually, useKeyboardShortcuts attaches to window. We should mock it to avoid side effects?
// No, let's keep it real to ensure handlers are wired correctly.
// But we need to cleanup listeners. useKeyboardShortcuts does that in useEffect cleanup.

describe('EditorLayout', () => {
    beforeEach(() => {
        // Reset store mock
        (useSceneStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            playback: { isPlaying: false },
            setPlayback: mockSetPlayback,
            removeActor: mockRemoveActor,
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders main layout components', () => {
        render(<EditorLayout viewport={<div data-testid="viewport">Viewport</div>} />);

        expect(screen.getByTestId('asset-library')).toBeTruthy();
        expect(screen.getByTestId('properties-panel')).toBeTruthy();
        expect(screen.getByTestId('timeline-panel')).toBeTruthy();
        expect(screen.getByTestId('viewport')).toBeTruthy();
        expect(screen.getByText('Animatica')).toBeTruthy(); // Logo
    });

    it('opens and closes Script Console', () => {
        render(<EditorLayout viewport={<div />} />);

        // Open
        fireEvent.click(screen.getByText('📜 Script'));
        expect(screen.getByTestId('script-console')).toBeTruthy();

        // Close
        fireEvent.click(screen.getByText('Close Script'));
        expect(screen.queryByTestId('script-console')).toBeNull();
    });

    it('opens and closes Export Modal', () => {
        render(<EditorLayout viewport={<div />} />);

        // Open
        fireEvent.click(screen.getByText('🎬 Export'));
        expect(screen.getByTestId('export-modal')).toBeTruthy();

        // Close
        fireEvent.click(screen.getByText('Close Export'));
        expect(screen.queryByTestId('export-modal')).toBeNull();
    });

    it('updates selected actor when created in library', () => {
        render(<EditorLayout viewport={<div />} />);

        // Initially no selection
        expect(screen.getByText('Properties: None')).toBeTruthy();

        // Create actor (simulated via mock button)
        fireEvent.click(screen.getByText('Create Actor'));

        // Selection updated
        expect(screen.getByText('Properties: test-actor')).toBeTruthy();
        expect(screen.getByText('Timeline: test-actor')).toBeTruthy();
    });

    it('handles keyboard shortcuts (Play/Pause)', () => {
        render(<EditorLayout viewport={<div />} />);

        // Press Space
        fireEvent.keyDown(window, { key: ' ' });

        expect(mockSetPlayback).toHaveBeenCalledWith({ isPlaying: true });
        expect(mockShowToast).toHaveBeenCalledWith('Playing', 'info', 1500);
    });

    it('handles keyboard shortcuts (Delete)', () => {
        render(<EditorLayout viewport={<div />} />);

        // Select an actor first
        fireEvent.click(screen.getByText('Create Actor'));

        // Press Delete
        fireEvent.keyDown(window, { key: 'Delete' });

        expect(mockRemoveActor).toHaveBeenCalledWith('test-actor');
        expect(mockShowToast).toHaveBeenCalledWith('Actor removed', 'info');

        // Selection should be cleared (in local state)
        // We verify via Properties Panel update
        expect(screen.getByText('Properties: None')).toBeTruthy();
    });

    it('handles keyboard shortcuts (Escape)', () => {
        render(<EditorLayout viewport={<div />} />);

        // Open Script Console
        fireEvent.click(screen.getByText('📜 Script'));
        expect(screen.getByTestId('script-console')).toBeTruthy();

        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByTestId('script-console')).toBeNull();

        // Open Export Modal
        fireEvent.click(screen.getByText('🎬 Export'));
        expect(screen.getByTestId('export-modal')).toBeTruthy();

        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByTestId('export-modal')).toBeNull();

        // Select Actor
        fireEvent.click(screen.getByText('Create Actor'));
        expect(screen.getByText('Properties: test-actor')).toBeTruthy();

        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.getByText('Properties: None')).toBeTruthy();
        expect(mockShowToast).toHaveBeenCalledWith('Actor deselected', 'info', 1000);
    });
});
