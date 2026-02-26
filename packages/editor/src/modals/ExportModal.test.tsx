// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { ExportModal } from './ExportModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Define mockDuration outside so we can control it
let currentDuration = 0;

vi.mock('@Animatica/engine', () => ({
    useSceneStore: (selector: (state: any) => any) => {
        return selector({ timeline: { duration: currentDuration } });
    },
}));

vi.mock('../components/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

// Mock translation to just return the key
vi.mock('../i18n/useTranslation', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

describe('ExportModal', () => {
    beforeEach(() => {
        currentDuration = 0;
    });

    it('disables export button when duration is 0', () => {
        currentDuration = 0;
        render(<ExportModal onClose={() => {}} />);

        const btn = screen.getByText('export.startExport') as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
    });

    it('enables export button when duration > 0', () => {
        currentDuration = 10;
        render(<ExportModal onClose={() => {}} />);

        const btn = screen.getByText('export.startExport') as HTMLButtonElement;
        expect(btn.disabled).toBe(false);
        expect(screen.getByText('10.0s')).toBeTruthy();
    });
});
