// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AssetLibrary } from './panels/AssetLibrary';
import { TimelinePanel } from './panels/TimelinePanel';
import { ExportModal } from './modals/ExportModal';
import { ScriptConsole } from './modals/ScriptConsole';

// Mock dependencies
vi.mock('./i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('./components/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('@Animatica/engine', () => {
    return {
        useSceneStore: (_selector: any) => {
            // Minimal mock for components that might use it (AssetLibrary in production uses it, but here we don't test that interaction deeply)
            return { actors: [], updateActor: vi.fn() };
        },
        Actor: {},
        PrimitiveActor: {},
        LightActor: {},
        CameraActor: {},
        CharacterActor: {},
        validateScript: vi.fn(() => ({ success: true })),
        getAiPrompt: vi.fn(() => 'Test Prompt'),
    };
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('Accessibility Audit', () => {
  afterEach(() => {
    cleanup();
  });

  describe('AssetLibrary', () => {
    it('should have accessible buttons for assets', () => {
      render(<AssetLibrary />);
      // Expand a category first (Primitives is default expanded)
      const boxBtn = screen.getByLabelText('Add Box');
      expect(boxBtn).toBeTruthy();
    });

    it('should have aria attributes on category headers', () => {
      render(<AssetLibrary />);
      // Use regex to match text content partially because of the arrow and count
      const categoryBtn = screen.getByRole('button', { name: /Primitives/i });
      expect(categoryBtn.getAttribute('aria-expanded')).toBe('true');
      expect(categoryBtn.getAttribute('aria-controls')).toMatch(/category-Primitives/);
    });
  });

  describe('TimelinePanel', () => {
    it('should have accessible transport controls', () => {
      render(<TimelinePanel selectedActorId={null} />);
      expect(screen.getByLabelText('timeline.play')).toBeTruthy();
      expect(screen.getByLabelText('timeline.stop')).toBeTruthy();
      expect(screen.getByLabelText('timeline.addKeyframe')).toBeTruthy();
    });

    it('should associate duration label with select', () => {
      render(<TimelinePanel selectedActorId={null} />);
      const select = screen.getByLabelText('timeline.duration');
      expect(select.tagName).toBe('SELECT');
    });

    it('should have label for scrubber', () => {
        render(<TimelinePanel selectedActorId={null} />);
        expect(screen.getByLabelText('Timeline scrubber')).toBeTruthy();
    });
  });

  describe('ExportModal', () => {
      it('should have correct dialog role and labels', () => {
          render(<ExportModal onClose={vi.fn()} />);
          const dialog = screen.getByRole('dialog');
          expect(dialog.getAttribute('aria-modal')).toBe('true');
          expect(dialog.getAttribute('aria-labelledby')).toBe('export-modal-title');

          expect(screen.getByLabelText('export.close')).toBeTruthy();
      });
  });

  describe('ScriptConsole', () => {
      it('should have correct dialog role and labels', () => {
          render(<ScriptConsole onClose={vi.fn()} />);
          const dialog = screen.getByRole('dialog');
          expect(dialog.getAttribute('aria-modal')).toBe('true');
          expect(dialog.getAttribute('aria-labelledby')).toBe('script-console-title');

          expect(screen.getByLabelText('Close')).toBeTruthy();
          expect(screen.getByLabelText('Scene Script JSON')).toBeTruthy();
      });
  });
});
