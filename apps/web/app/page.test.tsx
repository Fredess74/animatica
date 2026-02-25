import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Page from './page';

describe('Landing Page', () => {
  it('renders the main heading', () => {
    render(<Page />);
    const heading = screen.getByRole('heading', { level: 1, name: /Animatica Web/i });
    expect(heading).toBeDefined();
  });
});
