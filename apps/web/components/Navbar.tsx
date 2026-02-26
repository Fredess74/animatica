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
        <div className="desktop-only" style={{ gap: '2rem', alignItems: 'center' }}>
          <Link href="/explore">Explore</Link>
          <Link href="/pricing">Pricing</Link>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-default)' }} />
          <Link href="/login">Log In</Link>
          <Link href="/signup" className="btn btn-primary">Sign Up</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-only"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{ color: 'var(--text-primary)' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="mobile-only" style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 49
        }}>
          <div style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <Link href="/explore" onClick={() => setIsOpen(false)}>Explore</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
            <hr style={{ borderColor: 'var(--border-subtle)', width: '100%' }} />
            <Link href="/login" onClick={() => setIsOpen(false)}>Log In</Link>
            <Link href="/signup" onClick={() => setIsOpen(false)} style={{ color: 'var(--green-400)' }}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
