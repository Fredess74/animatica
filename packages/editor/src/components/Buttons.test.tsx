// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button, IconButton } from './Buttons';

describe('Button', () => {
  afterEach(cleanup);

  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByText('Ghost Button');
    expect(button.className).toContain('editor-btn--ghost');
  });

  it('applies size classes', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByText('Small Button');
    expect(button.className).toContain('editor-btn--sm');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeTruthy();
  });
});

describe('IconButton', () => {
  afterEach(cleanup);

  it('renders children correctly', () => {
    render(<IconButton aria-label="Icon">Icon</IconButton>);
    expect(screen.getByLabelText('Icon')).toBeTruthy();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<IconButton onClick={handleClick} aria-label="Click">Click</IconButton>);

    fireEvent.click(screen.getByLabelText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies active class', () => {
    render(<IconButton active aria-label="Active">Active</IconButton>);
    const button = screen.getByLabelText('Active');
    expect(button.className).toContain('editor-icon-btn--active');
  });

  it('applies size classes', () => {
    render(<IconButton size="sm" aria-label="Small">Small</IconButton>);
    const button = screen.getByLabelText('Small');
    expect(button.className).toContain('editor-icon-btn--sm');
  });

  it('can be disabled', () => {
    render(<IconButton disabled aria-label="Disabled">Disabled</IconButton>);
    const button = screen.getByLabelText('Disabled') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<IconButton ref={ref} aria-label="Ref">Ref</IconButton>);
    expect(ref.current).toBeTruthy();
  });
});
