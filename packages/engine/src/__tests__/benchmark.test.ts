import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3, AnimationTrack, ProjectMeta, Environment, Timeline, PlaybackState } from '../types';
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
        it('Number Interpolation (100k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        }, 10000);

        it('Vector3 Interpolation (100k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<Vector3>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: [i, i * 2, i * 3],
                    easing: 'linear',
                });
            }

            measure('Vector3 Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        }, 15000);

        it('Color Interpolation (100k ops, 10k keyframes)', () => {
            const keyframes: Keyframe<string>[] = [];
            for (let i = 0; i < 10000; i++) {
                keyframes.push({
                    time: i,
                    value: '#ff0000',
                    easing: 'linear',
                });
            }

            measure('Color Interpolation (100k ops)', () => {
                for (let i = 0; i < 100000; i++) {
                    const t = Math.random() * 10000;
                    interpolateKeyframes(keyframes, t);
                }
            });
        }, 15000);

        it('evaluateTracksAtTime (1k ops, 100 tracks x 10 keyframes)', () => {
            const tracks: AnimationTrack[] = [];
            for (let i = 0; i < 100; i++) {
                const keyframes: Keyframe<number>[] = [];
                for (let j = 0; j < 10; j++) {
                    keyframes.push({
                        time: j,
                        value: j * 10,
                        easing: 'linear',
                    });
                }
                tracks.push({
                    targetId: `actor-${i}`,
                    property: 'transform.position.x',
                    keyframes,
                });
            }

            measure('evaluateTracksAtTime (1k ops)', () => {
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

            measure('Schema Validation Speed (100 runs)', () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(projectState);
                }
            });
        });
    });

    describe('Store Performance', () => {
        it('Store Playback Updates (10k playback updates)', () => {
            const { setState, getState } = useSceneStore;

            const initialMeta: ProjectMeta = { title: 'Reset', version: '1.0.0' };
            const initialEnv: Environment = {
                ambientLight: { intensity: 0.5, color: '#ffffff' },
                sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                skyColor: '#87CEEB',
            };
            const initialTimeline: Timeline = { duration: 10, cameraTrack: [], animationTracks: [], markers: [] };
            const initialPlayback: PlaybackState = { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' };

            setState({
                meta: initialMeta,
                environment: initialEnv,
                actors: [],
                timeline: initialTimeline,
                library: { clips: [] },
                playback: initialPlayback,
            });

            measure('Store Playback Updates (10k ops)', () => {
                for (let i = 0; i < 10000; i++) {
                    getState().setPlayback({ currentTime: i * 0.1 });
                }
            });
        });

        it('Store Actor CRUD Throughput (1k actors)', { timeout: 30000 }, () => {
            const { setState, getState } = useSceneStore;

            const initialMeta: ProjectMeta = { title: 'CRUD', version: '1.0.0' };
            const initialEnv: Environment = {
                ambientLight: { intensity: 0.5, color: '#ffffff' },
                sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                skyColor: '#87CEEB',
            };
            const initialTimeline: Timeline = { duration: 10, cameraTrack: [], animationTracks: [], markers: [] };
            const initialPlayback: PlaybackState = { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' };

            setState({
                meta: initialMeta,
                environment: initialEnv,
                actors: [],
                timeline: initialTimeline,
                library: { clips: [] },
                playback: initialPlayback,
            });

            const prePopulatedActors: PrimitiveActor[] = [];
            for (let i = 0; i < 1000; i++) {
                prePopulatedActors.push({
                    id: `bench-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                });
            }

            measure('Store Add Actor (1k ops)', () => {
                for (const actor of prePopulatedActors) {
                    getState().addActor(actor);
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
