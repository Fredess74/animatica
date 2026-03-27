import { describe, it, afterAll } from 'vitest';
import { interpolateKeyframes, evaluateTracksAtTime } from '../animation/interpolate';
import { ProjectStateSchema } from '../importer/schemas';
import { useSceneStore } from '../store/sceneStore';
import type { Keyframe, ProjectState, Actor, PrimitiveActor, Vector3 } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const results: Record<string, string> = {};

const measure = (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    results[name] = `${(performance.now() - start).toFixed(2)}ms`;
};

const genKfs = <T>(n: number, val: (i: number) => T): Keyframe<T>[] =>
    Array.from({ length: n }, (_, i) => ({ time: i, value: val(i), easing: 'linear' }));

const genActor = (i: number): PrimitiveActor => ({
    id: `actor-${i}`, name: `Actor ${i}`, type: 'primitive', visible: true,
    transform: { position: [i, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    properties: { shape: 'box', color: '#ff0000', roughness: 0.5, metalness: 0.5, opacity: 1, wireframe: false }
});

describe('Engine Benchmarks', () => {
    afterAll(() => {
        const reportDir = path.resolve(__dirname, '../../../../reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
        fs.writeFileSync(path.join(reportDir, 'baseline_metrics.json'), JSON.stringify(results, null, 2));
    });

    it('Interpolation Speed (10k ops)', () => {
        const kfsNum = genKfs(10000, i => i * 10);
        const kfsVec = genKfs(10000, i => [i, i, i] as Vector3);
        const kfsCol = genKfs(10000, () => '#ff0000');
        measure('Number Interpolation', () => { for(let i=0; i<10000; i++) interpolateKeyframes(kfsNum, Math.random()*10000); });
        measure('Vector3 Interpolation', () => { for(let i=0; i<10000; i++) interpolateKeyframes(kfsVec, Math.random()*10000); });
        measure('Color Interpolation', () => { for(let i=0; i<10000; i++) interpolateKeyframes(kfsCol, Math.random()*10000); });
    });

    it('Track Evaluation Speed (1k tracks, 100 ops)', () => {
        const tracks = Array.from({ length: 1000 }, (_, i) => ({
            targetId: `actor-${i}`, property: 'transform.position', keyframes: genKfs(10, j => [j, 0, 0] as Vector3)
        }));
        measure('evaluateTracksAtTime (1k tracks)', () => {
            for(let i=0; i<100; i++) evaluateTracksAtTime(tracks, Math.random()*10);
        });
    });

    it('Schema Validation (100 runs, 100 actors)', () => {
        const project: ProjectState = {
            meta: { title: 'Bench', version: '1.0.0' },
            environment: { ambientLight: { intensity: 0.5, color: '#ffffff' }, sun: { position: [0,0,0], intensity: 1, color: '#ffffff' }, skyColor: '#000000' },
            actors: Array.from({ length: 100 }, (_, i) => genActor(i)),
            timeline: { duration: 60, cameraTrack: [], animationTracks: [], markers: [] },
            library: { clips: [] }
        };
        measure('Schema Validation', () => { for(let i=0; i<100; i++) ProjectStateSchema.parse(project); });
    });

    describe('Store Performance', { timeout: 30000 }, () => {
        it('Store Throughput', () => {
            const { getState, setState } = useSceneStore;
            setState({ actors: [], playback: { currentTime: 0, isPlaying: false, frameRate: 24, speed: 1, direction: 1, loopMode: 'none' } } as any);

            measure('Store Playback Updates (10k)', () => {
                for(let i=0; i<10000; i++) getState().setPlayback({ currentTime: i * 0.01 });
            });

            measure('Store Add Actor (1k)', () => {
                for(let i=0; i<1000; i++) getState().addActor(genActor(i));
            });

            measure('Store Update Actor (1k)', () => {
                for(let i=0; i<1000; i++) getState().updateActor(`actor-${i}`, { visible: false });
            });

            measure('Store Remove Actor (1k)', () => {
                for(let i=0; i<1000; i++) getState().removeActor(`actor-${i}`);
            });
        });
    });
});
