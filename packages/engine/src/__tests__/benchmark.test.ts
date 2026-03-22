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
 * Deterministic random number generator (LCG).
 */
class SeededRandom {
    private seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

/**
 * Measures performance of a function with a 10% warmup phase.
 * @param name Metric name.
 * @param iterations Number of iterations for the actual measurement.
 * @param fn Function to measure.
 * @param setup Optional setup/reset function run before warmup and measurement.
 */
function measure(name: string, iterations: number, fn: (i: number) => void, setup?: () => void) {
    // 1. Setup
    if (setup) setup();

    // 2. Warmup (10%)
    const warmupCount = Math.max(1, Math.floor(iterations * 0.1));
    for (let i = 0; i < warmupCount; i++) {
        fn(i);
    }

    // 3. Reset state for measurement
    if (setup) setup();

    // 4. Actual measurement
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn(i);
    }
    const end = performance.now();

    const duration = (end - start) / iterations;
    results[name] = `${duration.toFixed(4)}ms/op`;
    console.log(`${name}: ${duration.toFixed(4)}ms/op`);
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
        const rng = new SeededRandom(42);

        it('Number Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation (10k ops)', 10000, () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });

        it('Vector3 Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<Vector3>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: [i, i * 2, i * 3],
                    easing: 'linear',
                });
            }

            measure('Vector3 Interpolation (10k ops)', 10000, () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });

        it('Color Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<string>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: '#ff0000',
                    easing: 'linear',
                });
            }

            measure('Color Interpolation (10k ops)', 10000, () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });
    });

    describe('Schema Validation Performance', () => {
        const rng = new SeededRandom(123);

        it('Project Schema Validation (500 runs, 100 actors)', () => {
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

            measure('Schema Validation Speed (500 runs)', 500, () => {
                ProjectStateSchema.parse(projectState);
            });
        });
    });

    describe('Store Performance', () => {
        const setupStore = () => {
            const { setState } = useSceneStore;
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
                selectedActorId: null,
            });
        };

        it('Store Playback Updates (10k ops)', () => {
            const { getState } = useSceneStore;

            measure('Store Playback Updates (10k ops)', 10000, (i) => {
                getState().setPlayback({ currentTime: i * 0.01 });
            }, setupStore);
        });

        it('Store Actor CRUD Throughput (500 ops)', () => {
            const { getState } = useSceneStore;

            measure('Store Add Actor (500 ops)', 500, (i) => {
                getState().addActor({
                    id: `bench-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            }, setupStore);

            measure('Store Update Actor (500 ops)', 500, (i) => {
                getState().updateActor(`bench-${i}`, { visible: false });
            });

            measure('Store Remove Actor (500 ops)', 500, (i) => {
                getState().removeActor(`bench-${i}`);
            });
        });
    });
});
