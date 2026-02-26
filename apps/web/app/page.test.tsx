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
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: /Animatica Web/i })).toBeTruthy();
  });
});
