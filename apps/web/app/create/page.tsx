'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EditorLayout } from '@Animatica/editor';
import { SceneManager } from '@Animatica/engine';

export default function CreatePage() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'var(--bg-deep)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <EditorLayout
        viewport={
          <Canvas
            shadows
            camera={{ position: [0, 2, 5], fov: 50 }}
            style={{ width: '100%', height: '100%', background: '#1a1a1a' }}
          >
            <SceneManager showHelpers={true} />
            <gridHelper args={[20, 20, 0x444444, 0x222222]} />
          </Canvas>
        }
      />
    </div>
  );
}
