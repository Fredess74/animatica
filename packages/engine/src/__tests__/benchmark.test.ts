import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3 } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results: Record<string, string> = {};

/**
 * Deterministic random number generator using LCG algorithm.
 */
class SeededRandom {
    private seed: number;
    constructor(seed = 42) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

/**
 * Runs a benchmark with a 10% warmup phase.
 */
function runBenchmark(name: string, iterations: number, fn: () => void) {
    const warmup = Math.ceil(iterations * 0.1);
    // Warmup
    for (let i = 0; i < warmup; i++) {
        fn();
    }
    // Measure
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
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
        it('Number Interpolation', () => {
            const rng = new SeededRandom(1);
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            runBenchmark('Number Interpolation (10k ops)', 10000, () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });

        it('Vector3 Interpolation', () => {
            const rng = new SeededRandom(2);
            const keyframes: Keyframe<Vector3>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: [i, i * 2, i * 3],
                    easing: 'linear',
                });
            }

            runBenchmark('Vector3 Interpolation (10k ops)', 10000, () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });

        it('Color Interpolation', () => {
            const rng = new SeededRandom(3);
            const keyframes: Keyframe<string>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: '#ff0000',
                    easing: 'linear',
                });
            }

            runBenchmark('Color Interpolation (10k ops)', 10000, () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });
    });

    describe('Schema Validation Performance', () => {
        it('Project Schema Validation', () => {
            const rng = new SeededRandom(4);
            const actors: Actor[] = [];
            for (let i = 0; i < 100; i++) {
                const actor: PrimitiveActor = {
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: {
                        position: [rng.next() * 10, 0, 0],
                        rotation: [0, 0, 0],
                        scale: [1, 1, 1],
                    },
                    visible: true,
                    properties: {
                        shape: 'box',
                        color: '#ff0000',
                        roughness: 0.5,
                        metalness: 0.5,
                        opacity: 1,
                        wireframe: false,
                    },
                };
                actors.push(actor);
            }

            const projectState: ProjectState = {
                meta: {
                    title: 'Benchmark Project',
                    version: '1.0.0',
                },
                environment: {
                    ambientLight: { intensity: 0.5, color: '#ffffff' },
                    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                    skyColor: '#87CEEB',
                },
                actors,
                timeline: {
                    duration: 60,
                    cameraTrack: [],
                    animationTracks: [],
                    markers: [],
                },
                library: { clips: [] },
            };

            runBenchmark('Schema Validation Speed (100 runs)', 100, () => {
                ProjectStateSchema.parse(projectState);
            });
        });
    });

    describe('Store Performance', () => {
        it('Store Playback Updates', () => {
            const { setState, getState } = useSceneStore;

            setState({
                meta: { title: 'Reset', version: '1.0.0' },
                environment: {
                    ambientLight: { intensity: 0.5, color: '#ffffff' },
                    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                    skyColor: '#87CEEB',
                },
                actors: [],
                timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
                library: { clips: [] },
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            });

            let i = 0;
            runBenchmark('Store Playback Updates (10k ops)', 10000, () => {
                getState().setPlayback({ currentTime: (i++) * 0.1 });
            });
        });

        it('Store Actor CRUD Throughput', () => {
            const { setState, getState } = useSceneStore;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            } as any);

            let addI = 0;
            runBenchmark('Store Add Actor (1k ops)', 1000, () => {
                const i = addI++;
                getState().addActor({
                    id: `bench-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            });

            let updateI = 0;
            runBenchmark('Store Update Actor (1k ops)', 1000, () => {
                getState().updateActor(`bench-${updateI++}`, { visible: false });
            });

            let removeI = 0;
            runBenchmark('Store Remove Actor (1k ops)', 1000, () => {
                getState().removeActor(`bench-${removeI++}`);
            });
        });
    });
});
