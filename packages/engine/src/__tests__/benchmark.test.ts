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

/**
 * Seeded random number generator (Linear Congruential Generator)
 * for deterministic benchmarks.
 */
class SeededRandom {
    private seed: number;
    constructor(seed = 12345) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

const results: Record<string, string> = {};

/**
 * Measures performance of a function with a 10% warmup phase.
 * Records results in ms/op.
 */
function measure(name: string, iterations: number, fn: (rng: SeededRandom) => void) {
    const rng = new SeededRandom();
    const warmup = Math.floor(iterations * 0.1);

    // Warmup
    for (let i = 0; i < warmup; i++) {
        fn(rng);
    }

    // Measurement
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn(rng);
    }
    const end = performance.now();
    const totalDuration = end - start;
    const msPerOp = (totalDuration / iterations).toFixed(4);

    results[name] = `${msPerOp} ms/op`;
    console.log(`${name}: ${msPerOp} ms/op (${iterations} iterations)`);
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

            measure('Number Interpolation (10k ops)', 10000, (rng) => {
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

            measure('Vector3 Interpolation (10k ops)', 10000, (rng) => {
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

            measure('Color Interpolation (10k ops)', 10000, (rng) => {
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

            measure('Schema Validation Speed (100 runs)', 100, (_rng) => {
                ProjectStateSchema.parse(projectState);
            });
        });
    });

    describe('Store Performance', () => {
        it('Store Playback Updates (10k playback updates)', () => {
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

            measure('Store Playback Updates (10k ops)', 10000, (rng) => {
                getState().setPlayback({ currentTime: rng.next() * 100 });
            });
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            } as any);

            measure('Store Add Actor (1k ops)', 1000, (rng) => {
                const i = Math.floor(rng.next() * 1000000);
                getState().addActor({
                    id: `bench-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            });

            // For updates, we need some actors first
            const updateActorIds: string[] = [];
            for(let i=0; i<1000; i++) {
                const id = `update-bench-${i}`;
                getState().addActor({
                    id,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
                updateActorIds.push(id);
            }

            measure('Store Update Actor (1k ops)', 1000, (rng) => {
                const id = updateActorIds[Math.floor(rng.next() * updateActorIds.length)];
                getState().updateActor(id, { visible: rng.next() > 0.5 });
            });

            // For removal, we need a fresh set of 1.1k actors (100 for warmup, 1000 for measurement)
            const removeActorIds: string[] = [];
            for(let i=0; i<1100; i++) {
                const id = `remove-bench-${i}`;
                getState().addActor({
                    id,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
                removeActorIds.push(id);
            }

            measure('Store Remove Actor (1k ops)', 1000, (_rng) => {
                const id = removeActorIds.pop();
                if (id) getState().removeActor(id);
            });
        }, 20000);
    });
});
