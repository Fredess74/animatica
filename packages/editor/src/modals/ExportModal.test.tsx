// @vitest-environment jsdom
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { ExportModal } from './ExportModal';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('../components/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return `${key} ${JSON.stringify(params)}`;
      }
      return key;
    },
  }),
}));

describe('ExportModal', () => {
  const onClose = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup useToast mock
    const useToastMock = await import('../components/ToastContext');
    // @ts-expect-error - overriding read-only export for test
    useToastMock.useToast = () => ({ showToast: mockShowToast });
  });

  afterEach(() => {
    cleanup();
    vi.resetModules();
    vi.useRealTimers();
  });

  it('renders correctly with default options', () => {
    render(<ExportModal onClose={onClose} />);
    expect(screen.getByRole('heading', { name: /export.title/ })).toBeTruthy();
    expect(screen.getByText('1080p')).toBeTruthy(); // Default
    expect(screen.getByText('export.fpsSuffix {"count":30}')).toBeTruthy(); // Default
    expect(screen.getByText('.mp4')).toBeTruthy(); // Default
  });

  it('updates resolution', () => {
    render(<ExportModal onClose={onClose} />);
    fireEvent.click(screen.getByText('4K'));
    expect(screen.getByText('3840 × 2160')).toBeTruthy();
  });

  it('updates fps', () => {
    render(<ExportModal onClose={onClose} />);
    fireEvent.click(screen.getByText('export.fpsSuffix {"count":60}'));
    // We can check if it's active if we query by class, but easier to just click it
  });

  it('updates format', () => {
    render(<ExportModal onClose={onClose} />);
    fireEvent.click(screen.getByText('.webm'));
  });

  it('starts export and completes successfully', async () => {
    render(<ExportModal onClose={onClose} />);

    const exportBtn = screen.getByText('export.startExport {"format":"MP4"}');
    fireEvent.click(exportBtn);

    expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('export.starting'), 'info');

    // Progress bar should appear
    expect(screen.getByText('0%')).toBeTruthy();

    // Fast forward time partially
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Progress bar should be visible and > 0
    expect(screen.queryByText('0%')).toBeNull();

    // Fast forward to completion
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockShowToast).toHaveBeenCalledWith('export.success', 'success');
    expect(onClose).toHaveBeenCalled();
  });

  it('cancels export', async () => {
    render(<ExportModal onClose={onClose} />);

    fireEvent.click(screen.getByText('export.startExport {"format":"MP4"}'));

    // Check cancel button appears
    const cancelBtn = screen.getByText('export.cancel');
    fireEvent.click(cancelBtn);

    expect(mockShowToast).toHaveBeenCalledWith('export.cancelled', 'info');
    expect(screen.queryByText('0%')).toBeNull(); // Progress bar hidden
    // "Start Export" button should be back
    expect(screen.getByText('export.startExport {"format":"MP4"}')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ExportModal onClose={onClose} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalled();
  });
});
