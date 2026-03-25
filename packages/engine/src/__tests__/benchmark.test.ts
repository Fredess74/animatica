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

class SeededRandom {
    private state: number;
    constructor(seed = 42) {
        this.state = seed;
    }
    next() {
        this.state = (this.state * 16807) % 2147483647;
        return (this.state - 1) / 2147483646;
    }
}

const results: Record<string, string> = {};

function measure(name: string, iterations: number, fn: () => void) {
    // 10% Warmup
    const warmupCount = Math.max(1, Math.floor(iterations * 0.1));
    for (let i = 0; i < warmupCount; i++) {
        fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const totalDuration = end - start;
    const msPerOp = (totalDuration / iterations).toFixed(6);
    results[name] = `${msPerOp}ms/op`;
    console.log(`${name}: ${msPerOp}ms/op`);
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
        const random = new SeededRandom();

        it('Number Interpolation', () => {
            const keyframes: Keyframe<number>[] = [];
            for (let i = 0; i < 1000; i++) {
                keyframes.push({
                    time: i,
                    value: i * 10,
                    easing: 'linear',
                });
            }

            measure('Number Interpolation', 10000, () => {
                const t = random.next() * 1000;
                interpolateKeyframes(keyframes, t);
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

            measure('Vector3 Interpolation', 10000, () => {
                const t = random.next() * 1000;
                interpolateKeyframes(keyframes, t);
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

            measure('Color Interpolation', 10000, () => {
                const t = random.next() * 1000;
                interpolateKeyframes(keyframes, t);
            });
        });
    });

    describe('Schema Validation Performance', () => {
        const random = new SeededRandom();

        it('Project Schema Validation', () => {
            const actors: Actor[] = [];
            for (let i = 0; i < 100; i++) {
                const actor: PrimitiveActor = {
                    id: `actor-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: {
                        position: [random.next() * 10, 0, 0],
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

            measure('Schema Validation Speed', 100, () => {
                ProjectStateSchema.parse(projectState);
            });
        });
    });

    describe('Store Performance', () => {
        const random = new SeededRandom();

        it('Store Playback Updates', () => {
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

            measure('Store Playback Updates', 10000, () => {
                getState().setPlayback({ currentTime: random.next() });
            });
        });

        it('Store Actor CRUD Throughput', () => {
            const { setState, getState } = useSceneStore;
            let counter = 0;

            setState({
                actors: [],
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
            } as any);

            measure('Store Add Actor', 1000, () => {
                const i = counter++;
                getState().addActor({
                    id: `bench-${i}`,
                    name: `Actor ${i}`,
                    type: 'primitive',
                    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            });

            measure('Store Update Actor', 1000, () => {
                const actors = getState().actors;
                if (actors.length > 0) {
                    getState().updateActor(actors[0].id, { visible: !actors[0].visible });
                }
            });

            measure('Store Remove Actor', 1000, () => {
                const actors = getState().actors;
                if (actors.length > 0) {
                    getState().removeActor(actors[0].id);
                }
            });
        });
    });
});
