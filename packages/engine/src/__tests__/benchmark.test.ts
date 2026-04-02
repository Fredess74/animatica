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
 * Measures performance of a function with a warmup phase for JIT optimization.
 * @param name Benchmark name
 * @param fn Function to measure
 * @param iterations Number of times to run the function in the timed phase
 * @param warmupIterations Number of times to run the function in the warmup phase
 * @param onWarmupComplete Optional callback after warmup, before timed run
 */
function measure(
    name: string,
    fn: (i: number) => void,
    iterations: number,
    warmupIterations: number = Math.floor(iterations * 0.1),
    onWarmupComplete?: () => void
) {
    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
        fn(i);
    }

    if (onWarmupComplete) {
        onWarmupComplete();
    }

    // Timed phase
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn(i);
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
        it('Number Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation (10k ops)', (i) => {
                // Deterministic t based on i
                const t = (i * 1.37) % 10000;
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

            measure('Vector3 Interpolation (10k ops)', (i) => {
                const t = (i * 1.37) % 10000;
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

            measure('Color Interpolation (10k ops)', (i) => {
                const t = (i * 1.37) % 10000;
                interpolateKeyframes(keyframes, t);
            }, 10000);
        });
    });

    describe('Schema Validation Performance', () => {
        it('Project Schema Validation (100 runs, 100 actors)', () => {
            const actors: Actor[] = [];
            for (let i = 0; i < 100; i++) {
                const actor: PrimitiveActor = {
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: {
                        position: [i % 10, 0, 0],
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
                    description: 'Performance test project',
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

            measure('Schema Validation Speed (100 runs)', () => {
                ProjectStateSchema.parse(projectState);
            }, 100);
        });
    });

    describe('Store Performance', () => {
        const createBenchActor = (id: string): PrimitiveActor => ({
            id,
            name: `Actor ${id}`,
            type: 'primitive',
            transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            visible: true,
            properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
        });

        it('Store Playback Updates (10k playback updates)', () => {
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
                selectedActorId: null,
            });

            measure('Store Playback Updates (10k ops)', (i) => {
                getState().setPlayback({ currentTime: i * 0.1 });
            }, 10000);
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            const resetStore = () => setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
                selectedActorId: null,
            } as any);

            resetStore();
            measure('Store Add Actor (1k ops)', (i) => {
                getState().addActor(createBenchActor(`bench-add-${i}`));
            }, 1000);

            // Prepopulate for update benchmark
            resetStore();
            for (let i = 0; i < 1100; i++) {
                getState().addActor(createBenchActor(`bench-update-${i}`));
            }
            measure('Store Update Actor (1k ops)', (i) => {
                getState().updateActor(`bench-update-${i}`, { visible: false });
            }, 1000);

            // Prepopulate for removal benchmark
            resetStore();
            // Warmup will remove bench-remove-warmup-0 to 99
            for (let i = 0; i < 100; i++) {
                getState().addActor(createBenchActor(`bench-remove-warmup-${i}`));
            }

            let isWarmup = true;
            measure('Store Remove Actor (1k ops)', (i) => {
                const id = isWarmup ? `bench-remove-warmup-${i}` : `bench-remove-${i}`;
                getState().removeActor(id);
            }, 1000, 100, () => {
                isWarmup = false;
                // This runs after warmup. Warmup removed bench-remove-warmup-0 to 99.
                // We need to ensure bench-remove-0 to 999 exist for the timed run.
                for (let i = 0; i < 1000; i++) {
                    getState().addActor(createBenchActor(`bench-remove-${i}`));
                }
            });
        });
    });
});
