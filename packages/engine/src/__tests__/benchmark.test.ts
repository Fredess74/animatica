import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
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
    const duration = (end - start).toFixed(2);
    results[name] = `${duration}ms`;
}

describe('Engine Benchmarks', () => {
    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(path.join(reportDir, 'baseline_metrics.json'), JSON.stringify(results, null, 2));
    });

    describe('Interpolation Performance', () => {
        it('Number Interpolation (10k ops)', () => {
            const kf = Array.from({ length: 1000 }, (_, i) => ({ time: i, value: i * 10 }));
            measure('Number Interpolation', () => {
                for (let i = 0; i < 10000; i++) interpolateKeyframes(kf, Math.random() * 1000);
            });
        });

        it('Vector3 Interpolation (10k ops)', () => {
            const kf = Array.from({ length: 1000 }, (_, i) => ({ time: i, value: [i, i, i] as Vector3 }));
            measure('Vector3 Interpolation', () => {
                for (let i = 0; i < 10000; i++) interpolateKeyframes(kf, Math.random() * 1000);
            });
        });

        it('Color Interpolation (10k ops)', () => {
            const kf = Array.from({ length: 1000 }, (_, i) => ({ time: i, value: '#ff0000' }));
            measure('Color Interpolation', () => {
                for (let i = 0; i < 10000; i++) interpolateKeyframes(kf, Math.random() * 1000);
            });
        });

        it('evaluateTracksAtTime (1k ops, 100 tracks)', () => {
            const tracks: AnimationTrack[] = Array.from({ length: 100 }, (_, i) => ({
                targetId: `actor-${i}`,
                property: 'transform.position',
                keyframes: Array.from({ length: 100 }, (_, j) => ({ time: j, value: [j, j, j] as Vector3 })),
            }));
            measure('evaluateTracksAtTime', () => {
                for (let i = 0; i < 1000; i++) evaluateTracksAtTime(tracks, Math.random() * 100);
            });
        });
    });

    describe('Schema Validation', () => {
        it('ProjectStateSchema (500 actors)', () => {
            const actors: Actor[] = Array.from({ length: 500 }, (_, i) => ({
                id: `actor-${i}`, name: `Actor ${i}`, type: 'primitive',
                transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                visible: true, properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false },
            }));
            const state: ProjectState = {
                meta: { title: 'Bench', version: '1.0.0' },
                environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' }, skyColor: '#87CEEB' },
                actors, timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] }, library: { clips: [] },
            };
            measure('ProjectStateSchema Validation', () => {
                for (let i = 0; i < 10; i++) ProjectStateSchema.parse(state);
            });
        });
    });

    describe('Store Performance', () => {
        it('Store Playback Updates (10k ops)', () => {
            const { setState, getState } = useSceneStore;
            setState({ actors: [], playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1, direction: 1, loopMode: 'none' } } as unknown as ProjectState);
            measure('Store Playback Updates', () => {
                for (let i = 0; i < 10000; i++) getState().setPlayback({ currentTime: i * 0.1 });
            });
        });

        it('Store Actor Updates (1k ops)', () => {
            const { getState } = useSceneStore;
            for (let i = 0; i < 1000; i++) {
                getState().addActor({
                    id: `b-${i}`, name: `A ${i}`, type: 'primitive', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true, properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                });
            }
            measure('Store Actor Updates', () => {
                for (let i = 0; i < 1000; i++) getState().updateActor(`b-${i}`, { visible: false });
            });
        });
    });
});
