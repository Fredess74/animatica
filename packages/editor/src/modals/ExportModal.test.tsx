// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { ExportModal } from './ExportModal';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock useTranslation
vi.mock('../i18n/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'export.title') return 'Export Video';
            if (key === 'export.resolution') return 'Resolution';
            if (key === 'export.frameRate') return 'Frame Rate';
            if (key === 'export.format') return 'Format';
            if (key === 'export.fpsSuffix') return `${options?.count} FPS`;
            if (key === 'export.cancel') return 'Cancel';
            if (key === 'export.close') return 'Close';
            if (key === 'export.startExport') return `Export ${options?.format}`;
            if (key === 'export.success') return 'Export Successful';
            return key;
        },
    }),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

describe('ExportModal', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockShowToast.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    const mockOnClose = vi.fn();

    it('renders correctly', () => {
        render(<ExportModal onClose={mockOnClose} />);
        expect(screen.getByText(/Export Video/)).toBeTruthy();
        expect(screen.getByText('Resolution')).toBeTruthy();
        expect(screen.getByText('Frame Rate')).toBeTruthy();
        expect(screen.getByText('Format')).toBeTruthy();
    });

    it('updates options', () => {
        render(<ExportModal onClose={mockOnClose} />);

        const fps60 = screen.getByText('60 FPS');
        fireEvent.click(fps60);
        expect(fps60.className).toContain('export-option--active');

        const res4k = screen.getByText('4K');
        fireEvent.click(res4k);
        expect(res4k.className).toContain('export-option--active');

        expect(screen.getByText('3840 × 2160')).toBeTruthy();
    });

    it('handles export process', () => {
        render(<ExportModal onClose={mockOnClose} />);

        const exportBtn = screen.getByText('Export MP4');
        fireEvent.click(exportBtn);

        expect(mockShowToast).toHaveBeenCalledWith('export.starting', 'info');

        // Progress bar should appear
        expect(screen.getByText('0%')).toBeTruthy();

        // Advance timers to complete export
        act(() => {
             // 100 / 2 = 50 steps. 50 * 100ms = 5000ms
            vi.advanceTimersByTime(5500);
        });

        expect(mockShowToast).toHaveBeenCalledWith('Export Successful', 'success');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('cancels export', () => {
        render(<ExportModal onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('Export MP4'));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);

        expect(mockShowToast).toHaveBeenCalledWith('export.cancelled', 'info');
        expect(screen.queryByText('Cancel')).toBeNull(); // Should revert to Close/Export buttons
        expect(screen.getByText('Close')).toBeTruthy();
    });
});
