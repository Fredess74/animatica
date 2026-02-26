import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Navbar } from './Navbar';

afterEach(() => {
  cleanup();
});

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

describe('Navbar', () => {
  it('renders logo and desktop links', () => {
    render(<Navbar />);
    expect(screen.getByText('Animatica')).toBeTruthy();

    // Check for desktop links (they exist in DOM but might be hidden via CSS)
    expect(screen.getByText('Explore')).toBeTruthy();
    expect(screen.getByText('Pricing')).toBeTruthy();
    expect(screen.getByText('Log In')).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('toggles mobile menu', () => {
    render(<Navbar />);

    // Initially mobile menu should not be in document (isOpen is false)
    // The mobile menu container is conditional {isOpen && ...}
    // So queryByText('Log In') finds the desktop one.

    const menuButton = screen.getByLabelText('Toggle menu');
    expect(screen.getByTestId('menu-icon')).toBeTruthy();

    // Click to open
    fireEvent.click(menuButton);

    // Now X icon should show
    expect(screen.getByTestId('x-icon')).toBeTruthy();

    // And there should be more "Log In" links now (one desktop, one mobile)
    const loginLinks = screen.getAllByText('Log In');
    expect(loginLinks.length).toBe(2);

    // Click to close
    fireEvent.click(menuButton);
    expect(screen.getByTestId('menu-icon')).toBeTruthy();

    // Expect 1 again (desktop only)
    expect(screen.getAllByText('Log In').length).toBe(1);
  });
});
