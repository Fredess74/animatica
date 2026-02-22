import { describe, it } from 'vitest';
import { interpolateKeyframes } from '../animation/interpolate';
import { ProjectStateSchema } from '../schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor } from '../types';

function measure(_name: string, fn: () => void) {
    // Benchmark output suppressed for cleanup compliance
    fn();
}

describe('Engine Benchmarks', () => {
    it('Interpolation Speed (10k ops)', () => {
        // Setup: 10,000 keyframes
        const keyframes: Keyframe<number>[] = [];
        for (let i = 0; i < 10000; i++) {
            keyframes.push({
                time: i,
                value: i * 10,
                easing: 'linear',
            });
        }

        measure('Interpolation Speed (10k ops)', () => {
            for (let i = 0; i < 10000; i++) {
                const t = Math.random() * 10000;
                interpolateKeyframes(keyframes, t);
            }
        });
    }, 20000);

    it('Schema Validation Speed (100 runs)', () => {
        // Setup: Large project state with 100 actors
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
                animationTracks: [], // Could add tracks here for more load
            },
            library: { clips: [] },
        };

        measure('Schema Validation Speed (100 runs)', () => {
            for (let i = 0; i < 100; i++) {
                ProjectStateSchema.parse(projectState);
            }
        });
    }, 20000);

    it('Store Update Throughput (10k ops)', () => {
        // Setup: Reset store
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
            playback: { currentTime: 0, isPlaying: false, frameRate: 24 },
        });

        measure('Store Update Throughput (10k ops)', () => {
            for (let i = 0; i < 10000; i++) {
                getState().setPlayback({ currentTime: i * 0.1 });
            }
        });
    }, 20000);
});
