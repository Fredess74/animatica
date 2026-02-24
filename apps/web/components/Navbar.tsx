'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar" style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-base)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(8px)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)'
        }}>
          Animatica
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav" data-testid="desktop-nav" style={{ display: 'none', gap: '2rem', alignItems: 'center' }}>
          <Link href="/explore" className="nav-link">Explore</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-default)' }} />
          <Link href="/login" className="nav-link">Log In</Link>
          <Link href="/signup" className="btn btn-primary">Sign Up</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-toggle"
          data-testid="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{ color: 'var(--text-primary)' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="mobile-menu" data-testid="mobile-menu" style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 49
        }}>
          <Link href="/explore" onClick={() => setIsOpen(false)}>Explore</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
          <hr style={{ borderColor: 'var(--border-subtle)' }} />
          <Link href="/login" onClick={() => setIsOpen(false)}>Log In</Link>
          <Link href="/signup" onClick={() => setIsOpen(false)} style={{ color: 'var(--green-400)' }}>Sign Up</Link>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
        .nav-link {
          color: var(--text-primary);
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: var(--color-primary);
        }
        .mobile-menu a {
          color: var(--text-primary);
          padding: 0.5rem 0;
          text-decoration: none;
        }
        .mobile-menu a:hover {
          color: var(--color-primary);
        }
      `}</style>
    </nav>
  );
}
