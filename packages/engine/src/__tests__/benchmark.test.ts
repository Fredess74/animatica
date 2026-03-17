import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
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
 * Measures the execution time of a function and records it.
 */
function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    results[name] = `${duration}ms`;
    console.log(`${name}: ${duration}ms`);
}

/**
 * Runs a function multiple times to warm up the JIT compiler.
 */
function warmup(fn: () => void, iterations = 1000) {
    for (let i = 0; i < iterations; i++) {
        fn();
    }
}

/**
 * Deterministic pseudo-random generator to ensure consistent benchmark results.
 */
let seed = 12345;
function deterministicRandom() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
}

function resetSeed() {
    seed = 12345;
}

describe('Engine Benchmarks', () => {
    // High timeout for benchmark operations
    const BENCHMARK_TIMEOUT = 120000;

    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        // Load existing metrics to avoid overwriting unrelated ones if any,
        // though here we probably want a clean baseline.
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

            resetSeed();
            const run = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = deterministicRandom() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(run, 10);
            measure('Number Interpolation (10k ops)', run);
        }, BENCHMARK_TIMEOUT);

        it('Vector3 Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<Vector3>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: [i, i * 2, i * 3],
                    easing: 'linear',
                });
            }

            resetSeed();
            const run = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = deterministicRandom() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(run, 10);
            measure('Vector3 Interpolation (10k ops)', run);
        }, BENCHMARK_TIMEOUT);

        it('Color Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<string>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: '#ff0000',
                    easing: 'linear',
                });
            }

            resetSeed();
            const run = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = deterministicRandom() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(run, 10);
            measure('Color Interpolation (10k ops)', run);
        }, BENCHMARK_TIMEOUT);

        it('Boolean Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<boolean>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i % 2 === 0,
                    easing: 'step',
                });
            }

            resetSeed();
            const run = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = deterministicRandom() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(run, 10);
            measure('Boolean Interpolation (10k ops)', run);
        }, BENCHMARK_TIMEOUT);
    });

    describe('Timeline Performance', () => {
        it('Evaluate Tracks (1k tracks, 10 keyframes each)', () => {
            const tracks: { targetId: string; property: string; keyframes: Keyframe[] }[] = [];
            for (let i = 0; i < 1000; i++) {
                const keyframes: Keyframe[] = [];
                for (let j = 0; j < 10; j++) {
                    keyframes.push({
                        time: j * 10,
                        value: j * 100,
                        easing: 'linear',
                    });
                }
                tracks.push({
                    targetId: `actor-${i}`,
                    property: 'transform.position.x',
                    keyframes,
                });
            }

            const run = () => {
                for (let i = 0; i < 100; i++) {
                    evaluateTracksAtTime(tracks, i % 100);
                }
            };

            warmup(run, 5);
            measure('Evaluate 1k Tracks (100 runs)', run);
        }, BENCHMARK_TIMEOUT);

        it('Project Schema Validation (100 runs, 200 actors)', () => {
            resetSeed();
            const actors: Actor[] = [];
            for (let i = 0; i < 200; i++) {
                const actor: PrimitiveActor = {
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: {
                        position: [deterministicRandom() * 10, 0, 0],
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
                    description: 'Performance test project'
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

            const run = () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            };

            warmup(run, 5);
            measure('Schema Validation Speed (200 actors)', run);
        }, BENCHMARK_TIMEOUT);
    });

    describe('Store Performance', () => {
        it('Store Update Throughput (10k playback updates)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                meta: { title: 'Reset', version: '1.0.0', author: '', description: '' },
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

            const run = () => {
                for (let i = 0; i < 10000; i++) {
                    getState().setPlayback({ currentTime: i * 0.1 });
                }
            };

            warmup(run, 10);
            measure('Store Playback Updates (10k ops)', run);
        }, BENCHMARK_TIMEOUT);

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            } as any);

            const addRun = () => {
                for (let i = 0; i < 1000; i++) {
                    getState().addActor({
                        id: `bench-${i}`,
                        name: `Actor ${i}`,
                        type: 'primitive',
                        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                        visible: true,
                        properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                    } as PrimitiveActor);
                }
            };

            const updateRun = () => {
                for (let i = 0; i < 1000; i++) {
                    getState().updateActor(`bench-${i}`, { visible: false });
                }
            };

            const removeRun = () => {
                for (let i = 0; i < 1000; i++) {
                    getState().removeActor(`bench-${i}`);
                }
            };

            warmup(addRun, 2);
            setState({ actors: [] } as any);
            measure('Store Add Actor (1k ops)', addRun);

            warmup(updateRun, 2);
            measure('Store Update Actor (1k ops)', updateRun);

            // For remove benchmark, we need to ensure actors exist
            warmup(() => {
                addRun();
                removeRun();
            }, 2);
            addRun(); // Populate for the measure
            measure('Store Remove Actor (1k ops)', removeRun);
        }, BENCHMARK_TIMEOUT);
    });
});
