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

const results: Record<string, any> = {};

/**
 * Seeded random number generator for deterministic benchmarks.
 * Uses a simple LCG algorithm.
 */
class SeededRandom {
    private seed: number;
    constructor(seed = 12345) {
        this.seed = seed;
    }
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

function measure(name: string, fn: () => void, iterations: number = 1) {
    // 10% Warmup phase
    const warmupIterations = Math.max(1, Math.floor(iterations * 0.1));
    for (let i = 0; i < warmupIterations; i++) {
        fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();

    const duration = end - start;
    const msPerOp = duration / iterations;

    results[name] = {
        total_duration: `${duration.toFixed(2)}ms`,
        ms_per_op: `${msPerOp.toFixed(6)}ms/op`,
        iterations
    };
    console.log(`${name}: ${duration.toFixed(2)}ms (${msPerOp.toFixed(6)}ms/op)`);
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

            const rng = new SeededRandom();
            measure('Number Interpolation', () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            }, 10000);
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

            const rng = new SeededRandom();
            measure('Vector3 Interpolation', () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            }, 10000);
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

            const rng = new SeededRandom();
            measure('Color Interpolation', () => {
                const t = rng.next() * 10000;
                interpolateKeyframes(keyframes, t);
            }, 10000);
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

            measure('Project Schema Validation', () => {
                ProjectStateSchema.parse(projectState);
            }, 100);
        });
    });

    describe('Store Performance', () => {
        it('Store Update Throughput (10k playback updates)', () => {
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

            let counter = 0;
            measure('Store Playback Updates', () => {
                getState().setPlayback({ currentTime: (counter++) * 0.1 });
            }, 10000);
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            } as any);

            let addCounter = 0;
            measure('Store Add Actor', () => {
                getState().addActor({
                    id: `bench-${addCounter}`,
                    name: `Actor ${addCounter}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
                addCounter++;
            }, 1000);

            let updateCounter = 0;
            measure('Store Update Actor', () => {
                getState().updateActor(`bench-${updateCounter}`, { visible: false });
                updateCounter++;
            }, 1000);

            let removeCounter = 0;
            measure('Store Remove Actor', () => {
                getState().removeActor(`bench-${removeCounter}`);
                removeCounter++;
            }, 1000);
        });
    });
});
