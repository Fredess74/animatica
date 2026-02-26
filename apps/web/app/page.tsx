'use client';

/**
 * Animatica Landing Page — Hero + Features + CTA.
 * "The Animation Platform for Everyone. Create, Animate, Earn."
 */
import React from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    emoji: '🎬',
    title: '3D Viewport',
    desc: 'Real-time R3F canvas with ACES tone mapping, PBR materials, and cinematic postprocessing.',
  },
  {
    emoji: '🧑',
    title: 'Character System',
    desc: '52 ARKit morph targets, 8 animation states, skeletal rig, and 10 built-in presets.',
  },
  {
    emoji: '⏱️',
    title: 'Timeline & Keyframes',
    desc: 'Keyframe animation with easing, camera cuts, and multi-track timeline editor.',
  },
  {
    emoji: '🤖',
    title: 'AI Scene Generation',
    desc: 'Describe your scene in words — AI creates characters, props, and lighting for you.',
  },
  {
    emoji: '🎨',
    title: 'Expression Presets',
    desc: 'Happy, sad, angry, surprised — 9 one-click expressions with smooth blend transitions.',
  },
  {
    emoji: '🌦️',
    title: 'Environment & Weather',
    desc: 'Dynamic sky, fog, rain, snow, and dust. HDRI reflections for realistic lighting.',
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            <span className="landing-hero__logo">◆</span> Animatica
          </h1>
          <p className="landing-hero__subtitle">
            The Animation Platform for Everyone.
            <br />
            <strong>Create. Animate. Earn.</strong>
          </p>
          <p className="landing-hero__desc">
            Build stunning 3D animated scenes in your browser — no downloads, no plugins.
            AI-powered character creation, cinematic cameras, and one-click export.
          </p>
          <div className="landing-hero__cta">
            <Link href="/editor" className="btn btn--primary btn--lg">
              🎬 Open Editor
            </Link>
            <Link href="/signup" className="btn btn--ghost btn--lg">
              Create Account →
            </Link>
          </div>
        </div>

        {/* 3D Preview placeholder */}
        <div className="landing-hero__preview">
          <div className="landing-hero__viewport-placeholder">
            <span>Interactive 3D Preview</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <h2 className="landing-features__title">Everything You Need to Animate</h2>
        <div className="landing-features__grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__emoji">{f.emoji}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2>Ready to Create?</h2>
        <p>Jump straight into the editor — no sign up required.</p>
        <Link href="/editor" className="btn btn--primary btn--lg">
          Launch Animatica →
        </Link>
      </section>

      <style jsx>{`
        .landing {
          color: #e0e0e6;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Hero */
        .landing-hero {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4rem;
          padding: 6rem 2rem 4rem;
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap;
        }
        .landing-hero__content {
          flex: 1 1 400px;
          min-width: 320px;
        }
        .landing-hero__title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-hero__logo {
          display: inline-block;
          margin-right: 0.4rem;
        }
        .landing-hero__subtitle {
          font-size: 1.5rem;
          margin: 1rem 0;
          color: #ccc;
          line-height: 1.4;
        }
        .landing-hero__desc {
          font-size: 1.05rem;
          color: #999;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .landing-hero__cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .landing-hero__preview {
          flex: 1 1 400px;
          min-width: 320px;
        }
        .landing-hero__viewport-placeholder {
          width: 100%;
          height: 320px;
          border-radius: 16px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          font-size: 1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }
        .btn--primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
        }
        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(99,102,241,0.6);
        }
        .btn--ghost {
          background: transparent;
          color: #aaa;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .btn--ghost:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }
        .btn--lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        /* Features */
        .landing-features {
          padding: 4rem 2rem;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }
        .landing-features__title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 3rem;
        }
        .landing-features__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 2rem;
          text-align: left;
          transition: all 0.3s;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-4px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .feature-card__emoji {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        .feature-card__title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }
        .feature-card__desc {
          font-size: 0.9rem;
          color: #888;
          line-height: 1.6;
          margin: 0;
        }

        /* CTA */
        .landing-cta {
          text-align: center;
          padding: 5rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .landing-cta h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .landing-cta p {
          color: #888;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
