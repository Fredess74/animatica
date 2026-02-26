// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignupPage from './page';

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

describe('Signup Page', () => {
  it('renders signup form elements', () => {
    render(<SignupPage />);

    // Heading
    expect(screen.getByRole('heading', { level: 1, name: /Create Account/i })).toBeTruthy();

    // Inputs
    expect(screen.getByLabelText(/Full Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Password/i)).toBeTruthy();

    // Button
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeTruthy();

    // Login Link
    const link = screen.getByRole('link', { name: /Log in/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/login');
  });
});
