// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Button, IconButton, Input, Select, Tooltip } from './index';

afterEach(() => {
  cleanup();
});

describe('Editor Components', () => {
  describe('Button', () => {
    it('renders with correct text', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDefined();
      expect(button.className).toContain('editor-btn');
    });

    it('renders disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button', { name: /disabled/i }).hasAttribute('disabled')).toBe(true);
    });

    it('renders loading state', () => {
        render(<Button isLoading>Loading</Button>);
        const button = screen.getByRole('button', { name: /loading/i });
        expect(button.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('IconButton', () => {
    it('renders with icon', () => {
      render(<IconButton icon={<span data-testid="icon">Icon</span>} aria-label="Action" />);
      expect(screen.getByRole('button', { name: /action/i })).toBeDefined();
      expect(screen.getByTestId('icon')).toBeDefined();
    });

    it('renders tooltip wrapper when tooltip prop is present', () => {
        const { container } = render(<IconButton icon="X" tooltip="Close" />);
        // It renders a div wrapper with class 'editor-tooltip-trigger'
        expect(container.querySelector('.editor-tooltip-trigger')).toBeDefined();
        expect(screen.getByText('Close')).toBeDefined();
    });
  });

  describe('Input', () => {
    it('renders with label', () => {
      render(<Input label="Username" id="username" />);
      expect(screen.getByLabelText(/username/i)).toBeDefined();
    });

    it('renders error message', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      // aria-invalid="true" means it is invalid
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(screen.getByText('Invalid email')).toBeDefined();
    });
  });

  describe('Select', () => {
    it('renders options', () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      render(<Select label="Choose" options={options} />);
      expect(screen.getByLabelText(/choose/i)).toBeDefined();
      expect(screen.getByRole('combobox')).toBeDefined();
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });
  });

  describe('Tooltip', () => {
    it('renders children and content', () => {
      render(
        <Tooltip content="Help info">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: /hover me/i })).toBeDefined();
      expect(screen.getByText('Help info')).toBeDefined();
    });
  });
});
