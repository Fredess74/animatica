import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Footer } from './Footer';

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Footer', () => {
  it('renders on standard routes', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/i)).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('does not render on /create route', () => {
    mockUsePathname.mockReturnValue('/create');
    const { container } = render(<Footer />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render on /editor route', () => {
    mockUsePathname.mockReturnValue('/editor/123');
    const { container } = render(<Footer />);
    expect(container.firstChild).toBeNull();
  });
});
