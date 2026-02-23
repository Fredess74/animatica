import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import RootLayout from './layout'

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
}))

describe('RootLayout', () => {
  it('renders navbar and footer', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    )

    // Check for Navbar elements
    expect(screen.getByText('Animatica')).toBeDefined()
    expect(screen.getByText('Explore')).toBeDefined()

    // Check for Footer elements
    expect(screen.getByText(/All rights reserved/i)).toBeDefined()
    expect(screen.getByText('About')).toBeDefined()

    // Check for children
    expect(screen.getByTestId('child-content')).toBeDefined()
  })
})
