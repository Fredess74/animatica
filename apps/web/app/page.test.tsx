// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Page from './page';

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

describe('Landing Page', () => {
  it('renders hero section', () => {
    render(<Page />);
    expect(screen.getAllByText(/The Future of Animation is Here/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Start Creating/i)[0]).toBeDefined();
  });

  it('renders features grid', () => {
    render(<Page />);
    expect(screen.getAllByText(/AI Script to Scene/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Timeline Editor/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Export to 4K/i)[0]).toBeDefined();
  });
});
