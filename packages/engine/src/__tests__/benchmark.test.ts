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

function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    results[name] = `${duration}ms`;
    console.log(`${name}: ${duration}ms`);
}

describe('Engine Benchmarks', { timeout: 15000 }, () => {
    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        const reportPath = path.join(reportDir, 'baseline_metrics.json');

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        let finalResults = { ...results };

        if (fs.existsSync(reportPath)) {
            try {
                const existing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
                finalResults = { ...existing, ...results };
            } catch (e) {
                console.warn('Failed to parse existing baseline_metrics.json, overwriting.');
            }
        }

        fs.writeFileSync(
            reportPath,
            JSON.stringify(finalResults, null, 2)
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

        it('Complex Vector3 Interpolation (100k ops, 1k keyframes)', () => {
            const keyframes: Keyframe<Vector3>[] = [];
            for (let i = 0; i < 1000; i++) {
                keyframes.push({
                    time: i,
                    value: [Math.sin(i), Math.cos(i), i],
                    easing: i % 2 === 0 ? 'easeInOut' : 'linear',
                });
            }

            measure('Complex Vector3 Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 1000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        });

        it('Complex Color Interpolation (100k ops, 1k keyframes)', () => {
            const keyframes: Keyframe<string>[] = [];
            for (let i = 0; i < 1000; i++) {
                const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
                const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
                const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
                keyframes.push({
                    time: i,
                    value: `#${r}${g}${b}`,
                    easing: 'easeInOut',
                });
            }

            measure('Complex Color Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 1000;
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
                    markers: [],
                },
                library: { clips: [] },
            };

            measure('Schema Validation Speed (100 runs)', () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            });
        });

        it('Complex Project Schema Validation (10 runs, 1000 actors + timeline)', () => {
            const actors: Actor[] = [];
            for (let i = 0; i < 1000; i++) {
                actors.push({
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            }

            const projectState: ProjectState = {
                meta: { title: 'Complex Benchmark', version: '1.0.0' },
                environment: {
                    ambientLight: { intensity: 0.5, color: '#ffffff' },
                    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                    skyColor: '#87CEEB',
                },
                actors,
                timeline: {
                    duration: 60,
                    cameraTrack: Array.from({ length: 100 }, (_, i) => ({
                        id: `cut-${i}`,
                        time: i,
                        cameraId: 'cam-1',
                        value: { position: [0, 0, 0], rotation: [0, 0, 0], fov: 75 } as any,
                        easing: 'linear',
                        transition: 'cut',
                        transitionDuration: 0
                    })),
                    animationTracks: Array.from({ length: 10 }, (_, i) => ({
                        targetId: `actor-${i}`,
                        property: 'transform.position',
                        keyframes: Array.from({ length: 100 }, (_, j) => ({ time: j, value: [j, 0, 0] as Vector3, easing: 'linear' }))
                    })),
                    markers: [],
                },
                library: { clips: [] },
            };

            measure('Complex Schema Validation Speed (10 runs)', () => {
                for (let i = 0; i < 10; i++) {
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
                timeline: { duration: 10, cameraTrack: [], animationTracks: [], markers: [] },
                library: { clips: [] },
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
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

        it('Store High-Frequency Playback Updates (100k ops)', () => {
            const { getState } = useSceneStore;

            measure('Store High-Frequency Playback Updates (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    getState().setPlayback({ currentTime: i * 0.016 });
                }
            });
        });

        it('Store Bulk Actor Update (1k actors)', () => {
            const { setState, getState } = useSceneStore;

            const actors: Actor[] = [];
            for (let i = 0; i < 1000; i++) {
                actors.push({
                    id: `bulk-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ffffff', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            }

            setState({ actors });

            measure('Store Bulk Actor Update (1k ops)', () => {
                for (let i = 0; i < 1000; i++) {
                    getState().updateActor(`bulk-${i}`, { transform: { position: [i, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] } });
                }
            });
        });
    });
});
