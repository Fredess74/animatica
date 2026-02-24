// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EditorLayout } from './EditorLayout';
import { vi, describe, it, expect, afterEach } from 'vitest';
import React from 'react';

// Ensure cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock child components
vi.mock('../panels/AssetLibrary', () => ({
  AssetLibrary: () => <div data-testid="asset-library">Asset Library</div>
}));
vi.mock('../panels/PropertiesPanel', () => ({
  PropertiesPanel: () => <div data-testid="properties-panel">Properties Panel</div>
}));
vi.mock('../panels/TimelinePanel', () => ({
  TimelinePanel: () => <div data-testid="timeline-panel">Timeline Panel</div>
}));
vi.mock('../modals/ScriptConsole', () => ({
  ScriptConsole: () => <div data-testid="script-console">Script Console</div>
}));
vi.mock('../modals/ExportModal', () => ({
  ExportModal: () => <div data-testid="export-modal">Export Modal</div>
}));

// Mock Engine Store
const mockSetPlayback = vi.fn();
const mockRemoveActor = vi.fn();
vi.mock('@Animatica/engine', () => ({
  useSceneStore: () => ({
    playback: { isPlaying: false },
    setPlayback: mockSetPlayback,
    removeActor: mockRemoveActor,
  }),
}));

// Mock Toast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useToast: () => ({ showToast: mockShowToast }),
}));

describe('EditorLayout', () => {
  it('renders all main panels', () => {
    render(<EditorLayout viewport={<div data-testid="viewport">Viewport</div>} />);

    expect(screen.getByTestId('asset-library')).toBeTruthy();
    expect(screen.getByTestId('viewport')).toBeTruthy();
    expect(screen.getByTestId('properties-panel')).toBeTruthy();
    expect(screen.getByTestId('timeline-panel')).toBeTruthy();
  });

  it('renders resizers', () => {
    render(<EditorLayout viewport={<div data-testid="viewport" />} />);
    const resizers = screen.getAllByRole('separator');
    expect(resizers).toHaveLength(2);
  });

  it('toggles left sidebar', () => {
    render(<EditorLayout viewport={<div data-testid="viewport" />} />);

    const collapseButton = screen.getByLabelText('Collapse library');
    expect(collapseButton).toBeTruthy();

    fireEvent.click(collapseButton);

    const expandButton = screen.getByLabelText('Expand library');
    expect(expandButton).toBeTruthy();
  });

  it('toggles right sidebar', () => {
    render(<EditorLayout viewport={<div data-testid="viewport" />} />);

    const collapseButton = screen.getByLabelText('Collapse properties');
    expect(collapseButton).toBeTruthy();

    fireEvent.click(collapseButton);

    const expandButton = screen.getByLabelText('Expand properties');
    expect(expandButton).toBeTruthy();
  });
});
