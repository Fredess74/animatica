import { describe, it, expect } from 'vitest';
import { validateScript, importScript, tryImportScript } from './scriptImporter';

// ---- Valid project data ----

const validProject = {
    meta: { title: 'Test Scene', version: '1.0.0' },
    environment: {
        ambientLight: { intensity: 0.5, color: '#ffffff' },
        sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
        skyColor: '#87ceeb',
    },
    actors: [
        {
            id: 'cam-1',
            name: 'Main Camera',
            type: 'camera',
            transform: {
                position: [0, 5, 10],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            },
            visible: true,
            properties: { fov: 75, near: 0.1, far: 1000 },
        },
        {
            id: 'box-1',
            name: 'Floor',
            type: 'primitive',
            transform: {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [10, 0.1, 10],
            },
            visible: true,
            properties: {
                shape: 'box',
                color: '#8b7355',
                roughness: 0.9,
                metalness: 0.0,
                opacity: 1,
                wireframe: false,
            },
        },
    ],
    timeline: {
        duration: 30,
        cameraTrack: [],
        animationTracks: [],
    },
    library: { clips: [] },
};

// ---- Tests ----

describe('validateScript', () => {
    it('validates a correct JSON string', () => {
        const result = validateScript(JSON.stringify(validProject));
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.data).toBeDefined();
        expect(result.data!.meta.title).toBe('Test Scene');
    });

    it('handles nested { project: {...} } wrapper', () => {
        const wrapped = { project: validProject };
        const result = validateScript(JSON.stringify(wrapped));
        expect(result.success).toBe(true);
        expect(result.data!.meta.title).toBe('Test Scene');
    });

    it('returns error for invalid JSON syntax', () => {
        const result = validateScript('{ not valid json }');
        expect(result.success).toBe(false);
        expect(result.errors[0]).toContain('Invalid JSON');
    });

    it('returns detailed errors for schema violations', () => {
        const invalid = {
            meta: { title: '', version: 'bad-version' },
            environment: {
                ambientLight: { intensity: 0.5, color: 'not-hex' },
                sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                skyColor: '#87ceeb',
            },
            actors: [],
            timeline: { duration: 0, cameraTrack: [], animationTracks: [] },
            library: { clips: [] },
        };
        const result = validateScript(JSON.stringify(invalid));
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('detects missing required fields', () => {
        const result = validateScript(JSON.stringify({ meta: { title: 'X' } }));
        expect(result.success).toBe(false);
    });

    it('returns error for root level schema violation (no path)', () => {
        const result = validateScript('123'); // Parsed as number, which is not an object
        expect(result.success).toBe(false);
        // Error message should be the message itself since path is empty
        // Zod issue message for root object type mismatch seems to be this:
        expect(result.errors[0].toLowerCase()).toContain('expected object');
    });
});

describe('importScript', () => {
    it('returns ProjectState for valid input', () => {
        const data = importScript(JSON.stringify(validProject));
        expect(data.actors).toHaveLength(2);
        expect(data.timeline.duration).toBe(30);
    });

    it('throws for invalid input', () => {
        expect(() => importScript('{}')).toThrow('Scene import failed');
    });
});

describe('tryImportScript', () => {
    it('returns ok:true for valid input', () => {
        const result = tryImportScript(JSON.stringify(validProject));
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.actors).toHaveLength(2);
        }
    });

    it('returns ok:false for invalid input', () => {
        const result = tryImportScript('{}');
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.errors.length).toBeGreaterThan(0);
        }
    });
});
