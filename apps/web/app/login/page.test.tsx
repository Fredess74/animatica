// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

describe('Login Page', () => {
  it('renders login form elements', () => {
    render(<LoginPage />);

    // Heading
    expect(screen.getByRole('heading', { level: 1, name: /Welcome Back/i })).toBeTruthy();

    // Inputs
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Password/i)).toBeTruthy();

    // Button
    expect(screen.getByRole('button', { name: /Log In/i })).toBeTruthy();

    // Signup Link
    const link = screen.getByRole('link', { name: /Sign up/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/signup');
  });
});
