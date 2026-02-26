// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Tooltip } from './Tooltip';
import { IconButton } from './IconButton';

afterEach(() => {
  cleanup();
});

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDefined();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByText(/username/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/enter username/i)).toBeDefined();
  });

  it('handles changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText(/required field/i)).toBeDefined();
  });
});

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('renders options', () => {
    render(<Select options={options} defaultValue="1" />);
    // Use getAllByRole to debug if needed, but getByRole combobox should work for select
    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();
    // Options are children of select
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeDefined();
  });

  it('handles change', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('renders icon', () => {
    render(<IconButton icon={<span data-testid="icon">Icon</span>} aria-label="Action" />);
    expect(screen.getByTestId('icon')).toBeDefined();
    expect(screen.getByLabelText(/action/i)).toBeDefined();
  });
});

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text 1">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: /hover me/i })).toBeDefined();
  });

  it('renders content (hidden by default logic but present in DOM)', () => {
    render(
      <Tooltip content="Tooltip text 2">
        <button>Hover me</button>
      </Tooltip>
    );
    // The tooltip content is in the DOM but hidden via CSS classes
    expect(screen.getByText('Tooltip text 2')).toBeDefined();
  });
});
