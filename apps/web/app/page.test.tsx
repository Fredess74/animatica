import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import Page from './page';

// Inject React globally to fix "ReferenceError: React is not defined"
// in components that don't import React (Next.js pattern)
beforeAll(() => {
  global.React = React;
});

afterEach(() => {
  cleanup();
});

describe('Page', () => {
  it('renders main heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: 'Animatica Web' })).toBeDefined();
  });
});
