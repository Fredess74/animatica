import { describe, it, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { interpolateKeyframes } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3 } from '../types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const results: Record<string, string> = {};

function measure(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  results[name] = `${(performance.now() - start).toFixed(2)}ms`;
}

function createBenchActor(i: number): PrimitiveActor {
  return {
    id: `actor-${i}`,
    name: `Actor ${i}`,
    type: 'primitive',
    transform: { position: [i, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true,
    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false },
  };
}

describe('Engine Benchmarks', () => {
  afterAll(() => {
    const reportDir = path.resolve(__dirname, '../../../../reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, 'baseline_metrics.json'), JSON.stringify(results, null, 2));
  });

  describe('Interpolation Performance', () => {
    const runBench = (name: string, keyframes: Keyframe<unknown>[]) => {
      measure(name, () => {
        for (let i = 0; i < 10000; i++) interpolateKeyframes(keyframes, Math.random() * 10000);
      });
    };

    it('Number Interpolation (10k ops)', () => {
      const kfs: Keyframe<number>[] = Array.from({ length: 10000 }, (_, i) => ({ time: i, value: i, easing: 'linear' }));
      runBench('Number Interpolation (10k ops)', kfs);
    });

    it('Vector3 Interpolation (10k ops)', () => {
      const kfs: Keyframe<Vector3>[] = Array.from({ length: 10000 }, (_, i) => ({ time: i, value: [i, i, i], easing: 'linear' }));
      runBench('Vector3 Interpolation (10k ops)', kfs);
    });

    it('Color Interpolation (10k ops)', () => {
      const kfs: Keyframe<string>[] = Array.from({ length: 10000 }, (_, i) => ({ time: i, value: '#ff0000', easing: 'linear' }));
      runBench('Color Interpolation (10k ops)', kfs);
    });
  });

  describe('Schema Validation', () => {
    it('Project Schema Validation (100 runs)', () => {
      const project: ProjectState = {
        meta: { title: 'Bench', version: '1.0.0' },
        environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [0, 0, 0], intensity: 1, color: '#ffffff' }, skyColor: '#87CEEB' },
        actors: Array.from({ length: 100 }, (_, i) => createBenchActor(i)),
        timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
        library: { clips: [] },
      };
      measure('Schema Validation Speed (100 runs)', () => {
        for (let i = 0; i < 100; i++) ProjectStateSchema.parse(project);
      });
    });
  });

  describe('Store Performance', () => {
    const { getState, setState } = useSceneStore;

    it('Store Playback Updates (10k ops)', () => {
      setState(s => {
        s.playback.currentTime = 0;
      });
      measure('Store Playback Updates (10k ops)', () => {
        for (let i = 0; i < 10000; i++) getState().setPlayback({ currentTime: i * 0.1 });
      });
    });

    it('Store Actor CRUD (1k ops)', () => {
      setState(s => { s.actors = []; });
      measure('Store Add Actor (1k ops)', () => {
        for (let i = 0; i < 1000; i++) getState().addActor(createBenchActor(i));
      });
      measure('Store Update Actor (1k ops)', () => {
        for (let i = 0; i < 1000; i++) getState().updateActor(`actor-${i}`, { visible: false });
      });
      measure('Store Remove Actor (1k ops)', () => {
        for (let i = 0; i < 1000; i++) getState().removeActor(`actor-${i}`);
      });
    });
  });
});
