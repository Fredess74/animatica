import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        padding: 'var(--space-3xl) 0',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, var(--bg-surface) 0%, var(--bg-deep) 100%)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            marginBottom: 'var(--space-lg)',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            The Future of Animation is Here
          </h1>
          <p style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto var(--space-2xl)'
          }}>
            Turn your stories into animated films with AI.
            Write a script, generate scenes, and export in 4K.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <Link href="/create" className="btn btn-primary" style={{
              fontSize: 'var(--text-lg)',
              padding: 'var(--space-md) var(--space-2xl)',
              background: 'var(--green-600)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none'
            }}>
              Start Creating
            </Link>
            <Link href="/explore" className="btn btn-outline" style={{
              fontSize: 'var(--text-lg)',
              padding: 'var(--space-md) var(--space-2xl)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none'
            }}>
              Explore Films
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-xl)'
          }}>
            {/* Feature 1 */}
            <div style={{
              background: 'var(--bg-surface)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🤖</div>
              <h3 style={{ color: 'var(--green-400)', marginBottom: 'var(--space-sm)' }}>AI Script to Scene</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Simply write your dialogue and stage directions. Our AI engine builds the scene, places actors, and generates animation instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              background: 'var(--bg-surface)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>⏱️</div>
              <h3 style={{ color: 'var(--green-400)', marginBottom: 'var(--space-sm)' }}>Timeline Editor</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Fine-tune every movement with a professional-grade timeline. Add keyframes, adjust easing, and sync audio with precision.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              background: 'var(--bg-surface)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🎬</div>
              <h3 style={{ color: 'var(--green-400)', marginBottom: 'var(--space-sm)' }}>Export to 4K</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Render your masterpiece in high definition. Support for MP4 export at 60fps with spatial audio ready for YouTube.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
