// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button } from './Button';
import React from 'react';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

describe('Button', () => {
  it('renders with default props (primary variant, md size)', () => {
    render(<Button>Click me</Button>);

    // We can be more specific to avoid collision if cleanup fails, but cleanup should work.
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();

    // Check base classes
    expect(button.className).toContain('inline-flex');
    expect(button.className).toContain('items-center');
    expect(button.className).toContain('justify-center');
    expect(button.className).toContain('rounded-xl'); // Branding check

    // Check primary variant classes
    expect(button.className).toContain('bg-[var(--green-600)]');
    expect(button.className).toContain('text-white');

    // Check md size classes
    expect(button.className).toContain('h-10');
    expect(button.className).toContain('px-4');
  });

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button.className).toContain('bg-[var(--green-900)]');
    expect(button.className).toContain('text-[var(--green-200)]');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button', { name: /ghost/i });
    expect(button.className).toContain('bg-transparent');
    expect(button.className).toContain('text-[var(--green-600)]');
    expect(button.className).toContain('color-mix');
  });

  it('renders destructive variant', () => {
    render(<Button variant="destructive">Destructive</Button>);
    const button = screen.getByRole('button', { name: /destructive/i });
    expect(button.className).toContain('bg-[var(--color-error)]');
  });

  it('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button', { name: /outline/i });
    expect(button.className).toContain('border');
    expect(button.className).toContain('border-[var(--border-default)]');
  });

  it('renders small size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button', { name: /small/i });
    expect(button.className).toContain('h-8');
    expect(button.className).toContain('text-xs');
    expect(button.className).toContain('rounded-lg');
  });

  it('renders large size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button', { name: /large/i });
    expect(button.className).toContain('h-12');
    expect(button.className).toContain('text-base');
    expect(button.className).toContain('rounded-xl');
  });

  it('merges custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button.className).toContain('custom-class');
    expect(button.className).toContain('inline-flex');
  });

  it('passes through other props', () => {
    render(<Button aria-label="Test Label" disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /test label/i });
    expect(button.getAttribute('aria-label')).toBe('Test Label');
    expect(button).toHaveProperty('disabled', true);
  });
});
