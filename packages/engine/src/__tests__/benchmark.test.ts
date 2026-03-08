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

function warmup(fn: () => void, runs = 5) {
    for (let i = 0; i < runs; i++) {
        fn();
    }
}

function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    results[name] = `${duration}ms`;
    console.log(`${name}: ${duration}ms`);
}

describe('Engine Benchmarks', { timeout: 120000 }, () => {
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

    describe('Timeline Evaluation Performance', () => {
        it('evaluateTracksAtTime (1k tracks, 10 keyframes each)', () => {
            const tracks: any[] = [];
            for (let i = 0; i < 1000; i++) {
                const keyframes: Keyframe<number>[] = [];
                for (let j = 0; j < 10; j++) {
                    keyframes.push({
                        time: j,
                        value: j * 10,
                        easing: 'linear',
                    });
                }
                tracks.push({
                    id: `track-${i}`,
                    targetActorId: `actor-${i % 100}`,
                    targetProperty: 'position',
                    keyframes,
                });
            }

            const bench = () => {
                for (let i = 0; i < 100; i++) {
                    const t = Math.random() * 10;
                    evaluateTracksAtTime(tracks, t);
                }
            };

            warmup(bench);
            measure('Timeline Evaluation (1k tracks, 100 runs)', bench);
        });
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

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(bench);
            measure('Number Interpolation (10k ops)', bench);
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

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(bench);
            measure('Vector3 Interpolation (10k ops)', bench);
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

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(bench);
            measure('Color Interpolation (10k ops)', bench);
        });

        it('Boolean Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<boolean>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i % 2 === 0,
                    easing: 'step',
                });
            }

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(bench);
            measure('Boolean Interpolation (10k ops)', bench);
        });
    });

    describe('Schema Validation Performance', () => {
        it('Small Project Schema Validation (100 runs, 100 actors)', () => {
            const actors: Actor[] = [];
            for (let i = 0; i < 100; i++) {
                const actor: PrimitiveActor = {
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: {
                        position: [Math.random() * 10, 0, 0],
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

            const bench = () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            };

            warmup(bench);
            measure('Small Project Validation Speed (100 runs)', bench);
        });

        it('Large Project Schema Validation (10 runs, 200 actors)', () => {
            const actors: Actor[] = [];
            for (let i = 0; i < 200; i++) {
                const actor: PrimitiveActor = {
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: {
                        position: [Math.random() * 10, 0, 0],
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
                    title: 'Large Benchmark Project',
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

            const bench = () => {
                for (let i = 0; i < 10; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            };

            warmup(bench);
            measure('Large Project Validation Speed (10 runs)', bench);
        });
    });

    describe('Store Performance', () => {
        const resetStore = () => {
            useSceneStore.setState({
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
        };

        it('Store Update Throughput (10k playback updates)', () => {
            resetStore();

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    useSceneStore.getState().setPlayback({ currentTime: i * 0.1 });
                }
            };

            warmup(bench);
            resetStore();
            measure('Store Playback Updates (10k ops)', bench);
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            resetStore();

            const benchAdd = () => {
                for (let i = 0; i < 1000; i++) {
                    useSceneStore.getState().addActor({
                        id: `bench-${i}`,
                        name: `Actor ${i}`,
                        type: 'primitive',
                        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                        visible: true,
                        properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                    } as PrimitiveActor);
                }
            };

            const benchUpdate = () => {
                for (let i = 0; i < 1000; i++) {
                    useSceneStore.getState().updateActor(`bench-${i}`, { visible: false });
                }
            };

            const benchRemove = () => {
                for (let i = 0; i < 1000; i++) {
                    useSceneStore.getState().removeActor(`bench-${i}`);
                }
            };

            warmup(benchAdd);
            resetStore();
            measure('Store Add Actor (1k ops)', benchAdd);

            warmup(benchUpdate);
            measure('Store Update Actor (1k ops)', benchUpdate);

            warmup(benchRemove);
            measure('Store Remove Actor (1k ops)', benchRemove);
        });
    });
});
