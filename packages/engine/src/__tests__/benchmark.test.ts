import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore, type SceneStoreState } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3, AnimationTrack } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const results: Record<string, string> = {};

function measure(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  results[name] = `${(end - start).toFixed(2)}ms`;
}

describe('Engine Benchmarks', () => {
  afterAll(() => {
    const reportDir = path.resolve(__dirname, '../../../../reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, 'baseline_metrics.json'), JSON.stringify(results, null, 2));
  });

  it('Interpolation (50k ops, 1k keyframes)', () => {
    const kf = Array.from({ length: 1000 }, (_, i) => ({ time: i, value: i * 10, easing: 'linear' as const }));
    const kfV3 = kf.map(k => ({ ...k, value: [k.value, k.value, k.value] as Vector3 }));
    const kfColor = kf.map(k => ({ ...k, value: '#ff0000' }));

    measure('Number Interpolation (50k ops)', () => {
      for (let i = 0; i < 50000; i++) interpolateKeyframes(kf, Math.random() * 1000);
    });
    measure('Vector3 Interpolation (50k ops)', () => {
      for (let i = 0; i < 50000; i++) interpolateKeyframes(kfV3, Math.random() * 1000);
    });
    measure('Color Interpolation (50k ops)', () => {
      for (let i = 0; i < 50000; i++) interpolateKeyframes(kfColor, Math.random() * 1000);
    });
  });

  it('Multi-track Evaluation (10k ops, 100 tracks)', () => {
    const tracks: AnimationTrack[] = Array.from({ length: 100 }, (_, i) => ({
      targetId: `actor-${i}`,
      property: 'position',
      keyframes: [
        { time: 0, value: [0, 0, 0] as Vector3, easing: 'linear' },
        { time: 10, value: [10, 10, 10] as Vector3, easing: 'linear' }
      ]
    }));
    measure('evaluateTracksAtTime (10k ops)', () => {
      for (let i = 0; i < 10000; i++) evaluateTracksAtTime(tracks, Math.random() * 10);
    });
  });

  it('Schema Validation (100 runs, 500 actors)', () => {
    const actors: Actor[] = Array.from({ length: 500 }, (_, i) => ({
      id: `actor-${i}`, name: `A${i}`, type: 'primitive',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      visible: true, properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
    }));
    const state: ProjectState = {
      meta: { title: 'Bench', version: '1.0.0' },
      environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' }, skyColor: '#87CEEB' },
      actors, timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
      library: { clips: [] }
    };
    measure('Schema Validation Speed (100 runs)', () => {
      for (let i = 0; i < 100; i++) ProjectStateSchema.parse(state);
    });
  });

  it('Store Performance', () => {
    const { getState, setState } = useSceneStore;
    const initialState = {
      actors: [],
      selectedActorId: null,
      playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1, direction: 1, loopMode: 'none' as const },
      environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [0,0,0] as Vector3, intensity: 1, color: '#ffffff' }, skyColor: '#000000' },
      timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
      meta: { title: 'Bench', version: '1.0.0' },
      library: { clips: [] }
    };
    setState(initialState as unknown as SceneStoreState);

    measure('Store Playback (10k updates)', () => {
      for (let i = 0; i < 10000; i++) getState().setPlayback({ currentTime: i * 0.1 });
    });
    measure('Store CRUD (1k actors)', () => {
      for (let i = 0; i < 1000; i++) {
        getState().addActor({
          id: `b-${i}`, name: `B${i}`, type: 'primitive',
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          visible: true, properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
        });
      }
      for (let i = 0; i < 1000; i++) getState().updateActor(`b-${i}`, { visible: false });
      for (let i = 0; i < 1000; i++) getState().removeActor(`b-${i}`);
    });
  });
});
