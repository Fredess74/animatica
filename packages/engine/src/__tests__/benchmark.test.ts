import { describe, it, afterAll, vi, beforeAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import * as Easing from '../animation/easing';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3 } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock localStorage for Zustand persist middleware
const mockStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
vi.stubGlobal('localStorage', mockStorage);

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
    beforeAll(() => {
        // Reset store before benchmarks
        useSceneStore.setState({
            meta: { title: 'Benchmark', version: '1.0.0' },
            environment: {
                ambientLight: { intensity: 0.5, color: '#ffffff' },
                sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                skyColor: '#87CEEB',
            },
            actors: [],
            timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
            library: { clips: [] },
            playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
        });
    });

    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // Read existing metrics to avoid overwriting unrelated benchmarks if any
        let existingResults = {};
        const reportPath = path.join(reportDir, 'baseline_metrics.json');
        if (fs.existsSync(reportPath)) {
            try {
                existingResults = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
            } catch (e) {
                console.error('Failed to parse existing baseline_metrics.json', e);
            }
        }

        const finalResults = { ...existingResults, ...results };
        fs.writeFileSync(
            reportPath,
            JSON.stringify(finalResults, null, 2)
        );
    });

    describe('Easing Functions Performance', () => {
        it('Raw Easing Math (1M ops)', () => {
            const functions = [
                { name: 'linear', fn: Easing.linear },
                { name: 'easeIn', fn: Easing.easeIn },
                { name: 'easeOut', fn: Easing.easeOut },
                { name: 'easeInOut', fn: Easing.easeInOut },
                { name: 'step', fn: Easing.step },
                { name: 'bounce', fn: Easing.bounce },
                { name: 'elastic', fn: Easing.elastic },
            ];

            for (const { name, fn } of functions) {
                measure(`Easing: ${name} (1M ops)`, () => {
                    for (let i = 0; i < 1000000; i++) {
                        fn(i / 1000000);
                    }
                });
            }
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

        it('evaluateTracksAtTime (1k tracks, 10 keyframes each)', () => {
            const tracks = [];
            for (let i = 0; i < 1000; i++) {
                const keyframes = [];
                for (let k = 0; k < 10; k++) {
                    keyframes.push({ time: k, value: k, easing: 'easeInOut' as const });
                }
                tracks.push({
                    targetId: `actor-${i}`,
                    property: 'position.x',
                    keyframes,
                });
            }

            measure('evaluateTracksAtTime (1k tracks)', () => {
                for (let i = 0; i < 100; i++) {
                    evaluateTracksAtTime(tracks, i / 10);
                }
            });
        });
    });

    describe('Schema Validation Performance', () => {
        const createProject = (actorCount: number): ProjectState => {
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
                meta: { title: 'Benchmark Project', version: '1.0.0' },
                environment: {
                    ambientLight: { intensity: 0.5, color: '#ffffff' },
                    sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                    skyColor: '#87CEEB',
                },
                actors,
                timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
                library: { clips: [] },
            };
        };

        it('Project Schema Validation (100 runs, 100 actors)', () => {
            const project = createProject(100);
            measure('Schema Validation Speed (100 runs, 100 actors)', () => {
                for (let i = 0; i < 100; i++) {
                    ProjectStateSchema.parse(project);
                }
            });
        });

        it('Large Project Schema Validation (10 runs, 1000 actors)', () => {
            const project = createProject(1000);
            measure('Schema Validation Speed (10 runs, 1000 actors)', () => {
                for (let i = 0; i < 10; i++) {
                    ProjectStateSchema.parse(project);
                }
            });
        });
    });

    describe('Store Performance', { timeout: 15000 }, () => {
        it('Store Playback Updates (10k playback updates)', () => {
            const { getState } = useSceneStore;

            measure('Store Playback Updates (10k ops)', () => {
                for (let i = 0; i < 10000; i++) {
                    getState().setPlayback({ currentTime: i * 0.1 });
                }
            });
        });

        it('Store Actor CRUD Throughput (1k actors)', () => {
            const { getState } = useSceneStore;

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
