/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TimelinePanel } from './panels/TimelinePanel';
import { AssetLibrary } from './panels/AssetLibrary';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { ExportModal } from './modals/ExportModal';
import { ToastProvider } from './components/ToastContext';

// Mock translations
vi.mock('./i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe('Accessibility Audit', () => {
  describe('TimelinePanel', () => {
    it('has accessible transport controls', () => {
      render(<TimelinePanel selectedActorId={null} />);

      // These checks implicitly verify existence because getByRole throws if not found.
      // We also want to ensure they have accessible names.
      // Since we don't have jest-dom, we check attributes manually if needed,
      // but getByRole(..., { name: ... }) is the robust way.

      expect(screen.getByRole('button', { name: /timeline.stop/i })).not.toBeNull();
      expect(screen.getByRole('button', { name: /timeline.play/i })).not.toBeNull();
      expect(screen.getByRole('button', { name: /timeline.addKeyframe/i })).not.toBeNull();

      // Scrubber
      const scrubber = screen.getByRole('slider');
      expect(scrubber.getAttribute('aria-label')).toBeTruthy();

      // Duration select
      const durationSelect = screen.getByRole('combobox');
      expect(durationSelect.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('AssetLibrary', () => {
    it('has accessible category headers and items', () => {
      render(<AssetLibrary />);

      // Check category headers
      const primitiveHeader = screen.getByText('Primitives').closest('button');
      expect(primitiveHeader).not.toBeNull();
      expect(primitiveHeader?.getAttribute('aria-expanded')).toBeTruthy();

      // Check items
      const items = screen.getAllByRole('button').filter(b => b.classList.contains('asset-item'));
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('PropertiesPanel', () => {
    it('has accessible inputs', () => {
      const { container } = render(<PropertiesPanel selectedActorId="test-actor" />);

      // Vector3 inputs
      const numberInputs = screen.getAllByRole('spinbutton');
      expect(numberInputs.length).toBeGreaterThan(0);
      numberInputs.forEach(input => {
        expect(input.getAttribute('aria-label')).toBeTruthy();
      });

      // Slider inputs
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThan(0);
      sliders.forEach(slider => {
        expect(slider.getAttribute('aria-label')).toBeTruthy();
      });

      // Color input
      const colorInput = container.querySelector('input[type="color"]');
      expect(colorInput).not.toBeNull();
      expect(colorInput?.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('ExportModal', () => {
    it('is an accessible dialog', () => {
      render(
        <ToastProvider>
            <ExportModal onClose={() => {}} />
        </ToastProvider>
      );

      // Dialog role
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toBeNull();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();

      // Close button
      // There might be two close buttons (X icon and footer button)
      const closeButtons = screen.getAllByRole('button', { name: /export.close/i });
      expect(closeButtons.length).toBeGreaterThan(0);

      // Radiogroups
      const radioGroups = screen.getAllByRole('radiogroup');
      expect(radioGroups.length).toBeGreaterThan(0);

      // Radio buttons
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
      radios.forEach(radio => {
        expect(radio.getAttribute('aria-checked')).toBeTruthy();
      });
    });
  });
});
