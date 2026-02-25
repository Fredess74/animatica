// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { ExportModal } from './ExportModal';
import * as ToastContext from '../components/ToastContext';
import * as Translation from '../i18n/useTranslation';

// Mock timer functions
vi.useFakeTimers();

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast }),
}));

// Mock useTranslation
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

afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.clearAllMocks();
});

describe('ExportModal', () => {
    const mockOnClose = vi.fn();

    it('renders correctly with default values', () => {
        render(<ExportModal onClose={mockOnClose} />);

        // Title
        expect(screen.getByText('🎬 export.title')).toBeTruthy();

        // Resolutions
        expect(screen.getByText('720p')).toBeTruthy();
        expect(screen.getByText('1080p')).toBeTruthy(); // Default
        expect(screen.getByText('4K')).toBeTruthy();
        expect(screen.getByText('1920 × 1080')).toBeTruthy(); // 1080p details

        // FPS
        expect(screen.getByText('export.fpsSuffix {"count":24}')).toBeTruthy();
        expect(screen.getByText('export.fpsSuffix {"count":30}')).toBeTruthy(); // Default
        expect(screen.getByText('export.fpsSuffix {"count":60}')).toBeTruthy();

        // Format
        expect(screen.getByText('.mp4')).toBeTruthy(); // Default
        expect(screen.getByText('.webm')).toBeTruthy();

        // Buttons
        expect(screen.getByText('export.close')).toBeTruthy();
        expect(screen.getByText('export.startExport {"format":"MP4"}')).toBeTruthy();
    });

    it('updates resolution on click', () => {
        render(<ExportModal onClose={mockOnClose} />);

        const button4K = screen.getByText('4K');
        fireEvent.click(button4K);

        expect(screen.getByText('3840 × 2160')).toBeTruthy();
    });

    it('updates fps on click', () => {
        render(<ExportModal onClose={mockOnClose} />);

        const button60 = screen.getByText('export.fpsSuffix {"count":60}');
        fireEvent.click(button60);

        // Verify active state (class check is fragile, but functional test implies state change)
        // Here we just ensure no error. Visual class check would need checking classList.
        expect(button60.className).toContain('export-option--active');
    });

    it('starts export and shows progress', () => {
        render(<ExportModal onClose={mockOnClose} />);

        const exportButton = screen.getByText('export.startExport {"format":"MP4"}');
        fireEvent.click(exportButton);

        // Should show starting toast
        expect(mockShowToast).toHaveBeenCalledWith('export.starting {"resolution":"1080p","fps":30}', 'info');

        // Progress bar should appear
        expect(screen.getByText('0%')).toBeTruthy();
        expect(screen.getByText('export.cancel')).toBeTruthy();

        // Advance timers to simulate progress
        act(() => {
            vi.advanceTimersByTime(2000); // Should advance some percent
        });

        // Check progress > 0
        // The implementation adds 2% every 100ms. 2000ms = 20 * 2 = 40%
        expect(screen.getByText('40%')).toBeTruthy();
    });

    it('completes export and closes modal', () => {
        render(<ExportModal onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('export.startExport {"format":"MP4"}'));

        // Advance enough time for 100% (5000ms + buffer)
        act(() => {
            vi.advanceTimersByTime(6000);
        });

        expect(mockShowToast).toHaveBeenCalledWith('export.success', 'success');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('cancels export', () => {
        render(<ExportModal onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('export.startExport {"format":"MP4"}'));

        // Advance a bit
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const cancelButton = screen.getByText('export.cancel');
        fireEvent.click(cancelButton);

        expect(mockShowToast).toHaveBeenCalledWith('export.cancelled', 'info');
        // Progress bar should disappear or buttons reappear
        expect(screen.queryByText('export.cancel')).toBeNull();
        expect(screen.getByText('export.startExport {"format":"MP4"}')).toBeTruthy();
    });

    it('closes on close button click', () => {
        render(<ExportModal onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('export.close'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
