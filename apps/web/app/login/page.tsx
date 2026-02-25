import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h1>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-deep)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-deep)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Log In
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--color-primary)' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
