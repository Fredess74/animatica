import { describe, it, expect } from 'vitest';
import * as Engine from './index';

describe('Engine Public API', () => {
    it('should export useSceneStore as a function', () => {
        expect(typeof Engine.useSceneStore).toBe('function');
    });

    it('should export PrimitiveRenderer component', () => {
        expect(Engine.PrimitiveRenderer).toBeDefined();
    });

    it('should export importScript as a function', () => {
        expect(typeof Engine.importScript).toBe('function');
    });

    it('should export getAiPrompt as a function', () => {
        expect(typeof Engine.getAiPrompt).toBe('function');
    });

    it('should export interpolateKeyframes as a function', () => {
        expect(typeof Engine.interpolateKeyframes).toBe('function');
    });

    it('should export evaluateTracksAtTime as a function', () => {
        expect(typeof Engine.evaluateTracksAtTime).toBe('function');
    });

    it('should export Easing with all functions', () => {
        expect(Engine.Easing).toBeDefined();
        expect(typeof Engine.Easing.linear).toBe('function');
        expect(typeof Engine.Easing.quad).toBe('function');
        expect(typeof Engine.Easing.cubic).toBe('function');
        expect(typeof Engine.Easing.easeIn).toBe('function');
        expect(typeof Engine.Easing.easeOut).toBe('function');
        expect(typeof Engine.Easing.easeInOut).toBe('function');
        expect(typeof Engine.Easing.bounce).toBe('function');
        expect(typeof Engine.Easing.elastic).toBe('function');
        expect(typeof Engine.Easing.step).toBe('function');
    });

    it('should export PROMPT_STYLES array', () => {
        expect(Array.isArray(Engine.PROMPT_STYLES)).toBe(true);
        expect(Engine.PROMPT_STYLES.length).toBeGreaterThan(0);
    });
});
