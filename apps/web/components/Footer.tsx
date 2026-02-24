import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-deep)',
      padding: '2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <p style={{ color: 'var(--text-disabled)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Animatica. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
