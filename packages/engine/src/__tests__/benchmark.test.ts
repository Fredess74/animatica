import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, PrimitiveActor, Vector3 } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const results: Record<string, string> = {};

function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const duration = (performance.now() - start).toFixed(2);
    results[name] = `${duration}ms`;
}

describe('Engine Benchmarks', () => {
    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
        fs.writeFileSync(path.join(reportDir, 'baseline_metrics.json'), JSON.stringify(results, null, 2));
    });

    describe('Interpolation Performance', () => {
        const kf10k = Array.from({ length: 10000 }, (_, i) => ({ time: i, value: i * 10, easing: 'linear' as const } as Keyframe<number>));
        it('Number Interpolation (10k ops)', () => measure('Number Interpolation (10k ops)', () => {
            for (let i = 0; i < 10000; i++) interpolateKeyframes(kf10k, Math.random() * 10000);
        }));

        it('Multi-track evaluation (100 tracks, 100 kfs)', () => {
            const tracks = Array.from({ length: 100 }, (_, i) => ({
                targetId: `actor-${i}`, property: 'position',
                keyframes: Array.from({ length: 100 }, (_, j) => ({ time: j, value: [j, j, j] as Vector3, easing: 'linear' as const }))
            }));
            measure('Multi-track evaluation (100x100)', () => {
                for (let i = 0; i < 100; i++) evaluateTracksAtTime(tracks, Math.random() * 100);
            });
        });
    });

    describe('Schema Validation', () => {
        it('Project Schema (100 runs, 100 actors)', () => {
            const projectState: ProjectState = {
                meta: { title: 'Bench', version: '1.0.0' },
                environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' }, skyColor: '#87CEEB' },
                actors: Array.from({ length: 100 }, (_, i) => ({
                    id: `a-${i}`, name: `A ${i}`, type: 'primitive', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor)),
                timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
                library: { clips: [] },
            };
            measure('Schema Validation (100 runs)', () => {
                for (let i = 0; i < 100; i++) ProjectStateSchema.parse(projectState);
            });
        });
    });

    describe('Store Performance', () => {
        it('Store Actor CRUD (1k actors)', () => {
            const { getState, setState } = useSceneStore;
            setState({
                meta: { title: 'Bench', version: '1.0.0' },
                environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' }, skyColor: '#87CEEB' },
                actors: [],
                timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
                playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1.0, direction: 1, loopMode: 'none' },
                library: { clips: [] },
                selectedActorId: null,
            });
            measure('Store Add Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) getState().addActor({
                    id: `b-${i}`, name: `A ${i}`, type: 'primitive', transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, visible: true,
                    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
                } as PrimitiveActor);
            });
            measure('Store Update Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) getState().updateActor(`b-${i}`, { visible: false });
            });
            measure('Store Remove Actor (1k ops)', () => {
                for (let i = 0; i < 1000; i++) getState().removeActor(`b-${i}`);
            });
        });
    });
});
