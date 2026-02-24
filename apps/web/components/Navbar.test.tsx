import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Navbar } from './Navbar';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

afterEach(() => {
  cleanup();
});

describe('Navbar', () => {
  it('renders logo and links', () => {
    render(<Navbar />);
    expect(screen.getByText('Animatica')).toBeTruthy();
    expect(screen.getByText('Explore')).toBeTruthy();
    expect(screen.getByText('Pricing')).toBeTruthy();
    expect(screen.getByText('Log In')).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('toggles mobile menu on click', () => {
    render(<Navbar />);

    // Initially mobile menu should not be in the document
    const mobileMenu = screen.queryByTestId('mobile-menu');
    expect(mobileMenu).toBeNull();

    // Click the toggle button
    const toggleButton = screen.getByTestId('mobile-toggle');
    fireEvent.click(toggleButton);

    // Now mobile menu should be present
    expect(screen.getByTestId('mobile-menu')).toBeTruthy();
    expect(screen.getByTestId('x-icon')).toBeTruthy(); // Should show X icon

    // Click again to close
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
    expect(screen.getByTestId('menu-icon')).toBeTruthy(); // Should show Menu icon
  });
});
