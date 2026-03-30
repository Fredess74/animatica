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

const baselineMetrics: Record<string, string> = {};

function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    baselineMetrics[name] = `${duration}ms`;
    console.log(`${name}: ${duration}ms`);
}

describe('Engine Performance Benchmarks', { timeout: 30000 }, () => {
    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(
            path.join(reportDir, 'baseline_metrics.json'),
            JSON.stringify(baselineMetrics, null, 2)
        );
    });

    describe('Interpolation Performance (100k ops)', () => {
        it('Number Interpolation', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 1000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 1000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        });

        it('Vector3 Interpolation', () => {
            const keyframes: Keyframe<Vector3>[] = [];
            for (let i = 0; i < 1000; i++) {
                keyframes.push({
                    time: i,
                    value: [i, i * 2, i * 3],
                    easing: 'linear',
                });
            }

            measure('Vector3 Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 1000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        });

        it('Color Interpolation', () => {
            const keyframes: Keyframe<string>[] = [];
            for (let i = 0; i < 1000; i++) {
                keyframes.push({
                    time: i,
                    value: '#ff0000',
                    easing: 'linear',
                });
            }

            measure('Color Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 1000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        });

        it('Timeline Track Evaluation (100 tracks, 10 keyframes each)', () => {
            const tracks = [];
            for (let i = 0; i < 100; i++) {
                const keyframes: Keyframe<number>[] = [];
                for (let k = 0; k < 10; k++) {
                    keyframes.push({ time: k, value: k * 10, easing: 'linear' });
                }
                tracks.push({
                    targetId: `actor-${i}`,
                    property: 'transform.position.x',
                    keyframes,
                });
            }

            measure('Evaluate 100 Tracks (1000 iterations)', () => {
                for (let i = 0; i < 1000; i++) {
                    const t = Math.random() * 10;
                    evaluateTracksAtTime(tracks, t);
                }
            });
        });
    });

    describe('Schema Validation Performance', () => {
        it('Project Schema Validation (100 runs, 150 actors)', () => {
            const actors: Actor[] = [];
            for (let i = 0; i < 150; i++) {
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

            measure('Schema Validation Speed (100 runs, 150 actors)', () => {
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

            // Reset state
            setState({
                actors: [],
                selectedActorId: null,
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
});
