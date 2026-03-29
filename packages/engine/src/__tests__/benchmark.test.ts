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
 * Simple seedable pseudo-random number generator to ensure deterministic benchmarks.
 * LCG (Linear Congruential Generator) algorithm.
 */
class SeededRandom {
    private seed: number;
    constructor(seed: number = 42) {
        this.seed = seed;
    }
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

/**
 * Enhanced measure utility with warmup phase and deterministic execution.
 */
function measure(
    name: string,
    iterations: number,
    fn: (i: number, rng: SeededRandom) => void,
    onWarmupComplete?: (rng: SeededRandom) => void
) {
    const rng = new SeededRandom();
    const warmupIterations = Math.floor(iterations * 0.1);

    // Warmup phase (10% of iterations)
    for (let i = 0; i < warmupIterations; i++) {
        fn(i, rng);
    }

    if (onWarmupComplete) {
        onWarmupComplete(rng);
    }

    // Timed phase
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn(i, rng);
    }
    const end = performance.now();

    const totalDuration = end - start;
    const avgDuration = (totalDuration / iterations).toFixed(4);
    results[name] = `${avgDuration}ms/op (${totalDuration.toFixed(2)}ms total)`;
    console.log(`${name}: ${avgDuration}ms/op`);
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
        it('Number Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation (10k ops)', 10000, (i, rng) => {
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

            measure('Vector3 Interpolation (10k ops)', 10000, (i, rng) => {
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

            measure('Color Interpolation (10k ops)', 10000, (i, rng) => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            });
        });
    });

    describe('Schema Validation Performance', () => {
        it('Project Schema Validation (100 runs, 100 actors)', () => {
            const rng = new SeededRandom();
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
                    author: 'Benchmarker',
                    description: 'Benchmark Project',
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

            measure('Schema Validation Speed (100 runs)', 100, () => {
                ProjectStateSchema.parse(projectState);
            });
        });
    });

    describe('Store Performance', () => {
        it('Store Update Throughput (10k playback updates)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                meta: { author: 'Benchmarker', description: 'Reset' },
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

            measure('Store Playback Updates (10k ops)', 10000, (i) => {
                getState().setPlayback({ currentTime: i * 0.1 });
            });
        });

        it('Store Actor CRUD Throughput (500 actors)', () => {
            const { setState, getState } = useSceneStore;

            const resetStore = () => {
                setState({
                    actors: [],
                    playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
                } as any);
            };

            resetStore();

            measure('Store Add Actor (500 ops)', 500, (i) => {
                getState().addActor({
                    id: `bench-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            });

            measure('Store Update Actor (500 ops)', 500, (i) => {
                getState().updateActor(`bench-${i}`, { visible: false });
            });

            measure('Store Remove Actor (500 ops)', 500, (i) => {
                getState().removeActor(`bench-${i}`);
            }, () => {
                // onWarmupComplete: refill actors for the timed run
                resetStore();
                for (let i = 0; i < 500; i++) {
                    getState().addActor({
                        id: `bench-${i}`,
                        name: `Actor ${i}`,
                        type: 'primitive',
                        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                        visible: true,
                        properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                    } as PrimitiveActor);
                }
            });
        });
    });
});
