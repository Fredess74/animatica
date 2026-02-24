import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RootLayout from './layout';

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

afterEach(() => {
  cleanup();
});

describe('RootLayout', () => {
  it('renders navbar and footer', () => {
    // We suppress console.error for the expected hydration warning in tests due to <html> inside <div>
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    console.error = originalError;

    // Check for Navbar elements
    expect(screen.getByText('Animatica')).toBeDefined();
    expect(screen.getByText('Explore')).toBeDefined();

    // Check for Footer elements
    expect(screen.getByText(/All rights reserved/i)).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();

    // Check for children
    expect(screen.getByTestId('child-content')).toBeDefined();
  });
});
