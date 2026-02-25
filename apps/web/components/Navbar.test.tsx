import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from './Navbar';

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

    // Check Logo
    expect(screen.getByText('Animatica')).toBeDefined();

    // Check Desktop Links
    expect(screen.getByText('Explore')).toBeDefined();
    expect(screen.getByText('Pricing')).toBeDefined();
    expect(screen.getByText('Log In')).toBeDefined();
    expect(screen.getByText('Sign Up')).toBeDefined();
  });

  it('toggles mobile menu', () => {
    render(<Navbar />);

    // Toggle button should be present
    const toggle = screen.getByLabelText('Toggle menu');
    expect(toggle).toBeDefined();

    // Initially, count occurrences of "Explore" (should be 1 from desktop nav, even if hidden visually)
    const initialLinks = screen.getAllByText('Explore').length;

    // Click toggle to open mobile menu
    fireEvent.click(toggle);

    // Now mobile menu should be rendered, adding another "Explore" link
    const newLinks = screen.getAllByText('Explore').length;
    expect(newLinks).toBe(initialLinks + 1);

    // Click toggle again to close
    fireEvent.click(toggle);

    // Should return to initial count
    const finalLinks = screen.getAllByText('Explore').length;
    expect(finalLinks).toBe(initialLinks);
  });
});
