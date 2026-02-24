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
  it('renders logo', () => {
    render(<Navbar />);
    expect(screen.getByText('Animatica')).toBeDefined();
  });

  it('renders desktop links', () => {
    render(<Navbar />);
    // Note: In JSDOM, CSS display:none is not enforced unless we check styles explicitly.
    // Since desktop links are always in the DOM but hidden by CSS on mobile,
    // we just check they exist.
    expect(screen.getByText('Explore')).toBeDefined();
    expect(screen.getByText('Pricing')).toBeDefined();
    expect(screen.getByText('Log In')).toBeDefined();
    expect(screen.getByText('Sign Up')).toBeDefined();
  });

  it('toggles mobile menu', () => {
    render(<Navbar />);

    // Initial state: menu closed
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(screen.queryByTestId('menu-icon')).toBeDefined();
    expect(screen.queryByTestId('x-icon')).toBeNull();

    // Click to open
    fireEvent.click(menuButton);
    expect(screen.queryByTestId('x-icon')).toBeDefined();
    expect(screen.queryByTestId('menu-icon')).toBeNull();

    // Check for mobile menu links (they are rendered conditionally)
    // When open, we expect duplicates for links (one desktop, one mobile)
    const exploreLinks = screen.getAllByText('Explore');
    expect(exploreLinks.length).toBeGreaterThan(1);

    // Click to close
    fireEvent.click(menuButton);
    expect(screen.queryByTestId('menu-icon')).toBeDefined();
    expect(screen.queryByTestId('x-icon')).toBeNull();

    // Check mobile menu links are gone
    const exploreLinksClosed = screen.getAllByText('Explore');
    expect(exploreLinksClosed.length).toBe(1); // Only desktop link remains
  });

  it('closes mobile menu when link is clicked', () => {
    render(<Navbar />);
    const menuButton = screen.getByLabelText('Toggle menu');

    // Open menu
    fireEvent.click(menuButton);

    // Find mobile link. Since desktop link is first in DOM, mobile link is last.
    const exploreLinks = screen.getAllByText('Explore');
    const mobileLink = exploreLinks[exploreLinks.length - 1];

    fireEvent.click(mobileLink);

    // Should be closed now (Menu icon visible, X icon gone)
    expect(screen.queryByTestId('menu-icon')).toBeDefined();
    expect(screen.queryByTestId('x-icon')).toBeNull();
  });
});
