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

function warmup(fn: () => void, iterations = 100) {
    for (let i = 0; i < iterations; i++) {
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

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            };

            warmup(bench, 5);
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

            warmup(bench, 5);
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

            warmup(bench, 5);
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

            warmup(bench, 5);
            measure('Boolean Interpolation (10k ops)', bench);
        });

        it('Evaluate Tracks (100 tracks, 1k ops)', () => {
            const tracks: { targetId: string; property: string; keyframes: Keyframe<number>[] }[] = [];
            for (let i = 0; i < 100; i++) {
                const keyframes: Keyframe<number>[] = [];
                for (let j = 0; j < 10; j++) {
                    keyframes.push({ time: j, value: j, easing: 'linear' });
                }
                tracks.push({
                    targetId: `actor-${i}`,
                    property: 'position.x',
                    keyframes
                });
            }

            const bench = () => {
                for (let i = 0; i < 1000; i++) {
                    evaluateTracksAtTime(tracks as any[], Math.random() * 10);
                }
            };

            warmup(bench, 5);
            measure('Evaluate Tracks (1k ops)', bench);
        });
    });

    describe('Schema Validation Performance', () => {
        function createLargeProject(actorCount: number): ProjectState {
            const actors: Actor[] = [];
            for (let i = 0; i < actorCount; i++) {
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

            return {
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
        }

        it('Project Schema Validation (100 runs, 100 actors)', () => {
            const projectState = createLargeProject(100);

            const bench = () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            };

            warmup(bench, 2);
            measure('Schema Validation Speed (100 runs)', bench);
        });

        it('Large Project Schema Validation (100 runs, 200 actors)', () => {
            const projectState = createLargeProject(200);

            const bench = () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            };

            warmup(bench, 2);
            measure('Large Schema Validation Speed (100 runs)', bench);
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

            const bench = () => {
                for (let i = 0; i < 10000; i++) {
                    getState().setPlayback({ currentTime: i * 0.1 });
                }
            };

            warmup(bench, 5);
            measure('Store Playback Updates (10k ops)', bench);
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            } as any);

            measure('Store Add Actor (1k ops)', () => {
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
            });

            measure('Store Update Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) {
                    getState().updateActor(`bench-${i}`, { visible: false });
                }
            });

            measure('Store Remove Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) {
                    getState().removeActor(`bench-${i}`);
                }
            });
        });
    });
}, 120000);
