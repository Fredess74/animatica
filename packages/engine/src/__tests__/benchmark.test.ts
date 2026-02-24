import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes } from '../animation/interpolate';
import { ProjectStateSchema } from '../schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3 } from '../types';
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
        it('Number Interpolation (10k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation (10k ops)', () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
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

            measure('Vector3 Interpolation (10k ops)', () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
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

            measure('Color Interpolation (10k ops)', () => {
                for (let i = 0; i < 10000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            });
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
                },
                library: { clips: [] },
            };

            measure('Schema Validation Speed (100 runs)', () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            });
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
                timeline: { duration: 10, cameraTrack: [], animationTracks: [] },
                library: { clips: [] },
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, loop: false },
            });

            measure('Store Playback Updates (10k ops)', () => {
                for (let i = 0; i < 10000; i++) {
                    getState().setPlayback({ currentTime: i * 0.1 });
                }
            });
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, loop: false },
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
});
