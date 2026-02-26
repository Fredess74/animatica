// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EditorLayout } from './EditorLayout';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as engine from '@Animatica/engine';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Mock dependencies
vi.mock('../components/ToastContext', () => ({
  ToastProvider: ({ children }: { children: any }) => <div data-testid="toast-provider">{children}</div>,
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

// Mock child components
vi.mock('../panels/AssetLibrary', () => ({ AssetLibrary: () => <div data-testid="asset-library" /> }));
vi.mock('../panels/PropertiesPanel', () => ({ PropertiesPanel: () => <div data-testid="properties-panel" /> }));
vi.mock('../panels/TimelinePanel', () => ({ TimelinePanel: () => <div data-testid="timeline-panel" /> }));
vi.mock('../modals/ScriptConsole', () => ({ ScriptConsole: ({ onClose }: any) => <div data-testid="script-console"><button onClick={onClose}>Close Script</button></div> }));
vi.mock('../modals/ExportModal', () => ({ ExportModal: ({ onClose }: any) => <div data-testid="export-modal"><button onClick={onClose}>Close Export</button></div> }));

vi.mock('@Animatica/engine', () => ({
  useSceneStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

describe('EditorLayout', () => {
  const mockSetPlayback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock store
    (engine.useSceneStore as any).mockReturnValue({
      playback: { isPlaying: false },
      setPlayback: mockSetPlayback,
      removeActor: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.resetModules();
  });

  it('renders the layout correctly', () => {
    render(<EditorLayout viewport={<div data-testid="viewport">Viewport</div>} />);

    expect(screen.getByText('Animatica')).toBeTruthy();
    expect(screen.getByTestId('asset-library')).toBeTruthy();
    expect(screen.getByTestId('properties-panel')).toBeTruthy();
    expect(screen.getByTestId('timeline-panel')).toBeTruthy();
    expect(screen.getByTestId('viewport')).toBeTruthy();
  });

  it('opens ScriptConsole when button is clicked', () => {
    render(<EditorLayout viewport={<div />} />);

    fireEvent.click(screen.getByText('📜 Script'));
    expect(screen.getByTestId('script-console')).toBeTruthy();
  });

  it('opens ExportModal when button is clicked', () => {
    render(<EditorLayout viewport={<div />} />);

    fireEvent.click(screen.getByText('🎬 Export'));
    expect(screen.getByTestId('export-modal')).toBeTruthy();
  });

  it('closes ScriptConsole via callback', () => {
    render(<EditorLayout viewport={<div />} />);

    fireEvent.click(screen.getByText('📜 Script'));
    fireEvent.click(screen.getByText('Close Script'));

    expect(screen.queryByTestId('script-console')).toBeNull();
  });

  it('closes ExportModal via callback', () => {
    render(<EditorLayout viewport={<div />} />);

    fireEvent.click(screen.getByText('🎬 Export'));
    fireEvent.click(screen.getByText('Close Export'));

    expect(screen.queryByTestId('export-modal')).toBeNull();
  });

  it('uses keyboard shortcuts', () => {
    render(<EditorLayout viewport={<div />} />);

    expect(useKeyboardShortcuts).toHaveBeenCalledWith(expect.objectContaining({
      onPlayPause: expect.any(Function),
      onSave: expect.any(Function),
      onUndo: expect.any(Function),
      onDelete: expect.any(Function),
      onEscape: expect.any(Function),
    }));
  });
});
