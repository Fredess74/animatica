import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import * as Easing from '../animation/easing';
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
    console.log(`${name}: ${duration}ms`);
}

describe('Engine Benchmarks', () => {
    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(
            path.join(reportDir, 'baseline_metrics.json'),
            JSON.stringify(results, null, 2)
        );
    });

    describe('Interpolation Performance', () => {
        it('Number Interpolation (10k ops)', () => {
            const keyframes: Keyframe<number>[] = Array.from({ length: 1000 }, (_, i) => ({
                time: i, value: i * 10, easing: 'linear'
            }));
            measure('Number Interpolation (10k ops)', () => {
                for (let i = 0; i < 10000; i++) interpolateKeyframes(keyframes, Math.random() * 1000);
            });
        });

        it('Multi-track Evaluation (1k tracks)', () => {
            const tracks: AnimationTrack[] = Array.from({ length: 1000 }, (_, i) => ({
                targetId: `actor-${i}`,
                property: 'position',
                keyframes: Array.from({ length: 10 }, (_, j) => ({ time: j, value: [j, 0, 0] as Vector3, easing: 'linear' }))
            }));
            measure('Multi-track Evaluation (1k tracks)', () => {
                for (let i = 0; i < 100; i++) evaluateTracksAtTime(tracks, Math.random() * 10);
            });
        });

        it('Unsorted Keyframe Overhead (1k ops)', () => {
            const keyframes: Keyframe<number>[] = Array.from({ length: 100 }, () => ({
                time: Math.random() * 100, value: Math.random(), easing: 'linear'
            }));
            measure('Unsorted Keyframe Overhead (1k ops)', () => {
                for (let i = 0; i < 1000; i++) interpolateKeyframes(keyframes, Math.random() * 100);
            });
        });
    });

    describe('Easing Performance', () => {
        it('Comprehensive Easing (1M ops)', () => {
            const easings = Object.values(Easing).filter(f => typeof f === 'function');
            measure('Comprehensive Easing (1M ops)', () => {
                for (let i = 0; i < 1000000; i++) (easings[i % easings.length] as Function)(Math.random());
            });
        });
    });

    describe('Schema Validation Performance', () => {
        const createProject = (actorCount: number): ProjectState => ({
            meta: { title: 'Bench', version: '1.0.0' },
            environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' }, skyColor: '#87CEEB' },
            actors: Array.from({ length: actorCount }, (_, i) => ({
                id: `a-${i}`, name: `A ${i}`, type: 'primitive', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, visible: true,
                properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
            } as PrimitiveActor)),
            timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
            library: { clips: [] }
        });

        it('Schema Validation (100 runs, 1k actors)', () => {
            const project = createProject(1000);
            measure('Schema Validation (100 runs, 1k actors)', () => {
                for (let i = 0; i < 100; i++) ProjectStateSchema.parse(project);
            });
        });
    });

    describe('Store Performance', { timeout: 30000 }, () => {
        it('Store Playback Updates (10k ops)', () => {
            const { getState } = useSceneStore;
            measure('Store Playback Updates (10k ops)', () => {
                for (let i = 0; i < 10000; i++) getState().setPlayback({ currentTime: i * 0.1 });
            });
        });

        it('Store Actor CRUD (1k actors)', () => {
            const { getState } = useSceneStore;
            measure('Store Add Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) getState().addActor({
                    id: `b-${i}`, name: `A ${i}`, type: 'primitive', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            });
            measure('Store Update Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) getState().updateActor(`b-${i}`, { visible: false });
            });
            measure('Store Remove Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) getState().removeActor(`b-${i}`);
            });
        });
    });
});
