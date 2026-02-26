import { describe, it, expect } from 'vitest';
import { applyAnimationToActor, resolveActiveCamera, setDeepValue } from './animationUtils';
import { CameraCut, PrimitiveActor } from '../types';

describe('animationUtils', () => {
  describe('resolveActiveCamera', () => {
    // Mock CameraCut with required properties
    const cuts: CameraCut[] = [
      { id: '1', time: 0, cameraId: 'cam1', transition: 'cut', transitionDuration: 0 },
      { id: '2', time: 5, cameraId: 'cam2', transition: 'cut', transitionDuration: 0 },
      { id: '3', time: 10, cameraId: 'cam1', transition: 'cut', transitionDuration: 0 },
    ];

    it('returns null for empty cuts', () => {
      expect(resolveActiveCamera([], 0)).toBeNull();
    });

    it('returns null if time is before first cut', () => {
      expect(resolveActiveCamera(cuts, -1)).toBeNull();
    });

    it('returns the correct camera for a given time', () => {
      expect(resolveActiveCamera(cuts, 0)).toBe('cam1');
      expect(resolveActiveCamera(cuts, 2.5)).toBe('cam1');
      expect(resolveActiveCamera(cuts, 5)).toBe('cam2');
      expect(resolveActiveCamera(cuts, 7.5)).toBe('cam2');
      expect(resolveActiveCamera(cuts, 10)).toBe('cam1');
      expect(resolveActiveCamera(cuts, 15)).toBe('cam1');
    });
  });

  describe('setDeepValue', () => {
    it('sets value at root', () => {
        const obj = { a: 1 };
        const result = setDeepValue(obj, ['a'], 2);
        expect(result.a).toBe(2);
        expect(result).not.toBe(obj);
    });

    it('sets nested value', () => {
        const obj = { a: { b: 1 } };
        const result = setDeepValue(obj, ['a', 'b'], 2);
        expect(result.a.b).toBe(2);
        expect(result).not.toBe(obj);
        expect(result.a).not.toBe(obj.a);
    });

    it('creates nested objects if missing', () => {
        const obj = {};
        const result = setDeepValue(obj, ['a', 'b'], 2);
        expect(result.a.b).toBe(2);
    });

    it('updates array element by index', () => {
        const obj = { arr: [1, 2, 3] };
        const result = setDeepValue(obj, ['arr', '1'], 5);
        expect(result.arr).toEqual([1, 5, 3]);
        expect(result.arr).not.toBe(obj.arr);
        expect(Array.isArray(result.arr)).toBe(true);
    });

    it('updates property on array (non-numeric index)', () => {
        const arr: any = [1, 2];
        arr.customProp = 'test';
        const result = setDeepValue(arr, ['customProp'], 'updated');
        expect(result.customProp).toBe('updated');
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe(1);
    });
  });

  describe('applyAnimationToActor', () => {
    const baseActor: PrimitiveActor = {
      id: 'actor1',
      type: 'primitive',
      name: 'Box',
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      properties: {
        shape: 'box',
        color: '#ffffff',
        roughness: 0.5,
        metalness: 0.5,
        opacity: 1,
        wireframe: false,
      },
    };

    it('returns original actor if no animated props', () => {
      const result = applyAnimationToActor(baseActor, undefined);
      expect(result).toBe(baseActor);
    });

    it('returns original actor if empty animated props', () => {
      const result = applyAnimationToActor(baseActor, new Map());
      expect(result).toBe(baseActor);
    });

    it('updates top-level properties', () => {
      const props = new Map<string, unknown>([['visible', false]]);
      const result = applyAnimationToActor(baseActor, props);

      expect(result).not.toBe(baseActor);
      expect(result.visible).toBe(false);
      expect(result.transform).toBe(baseActor.transform);
    });

    it('updates nested properties (transform.position)', () => {
      const newPos = [1, 2, 3];
      const props = new Map<string, unknown>([['transform.position', newPos]]);
      const result = applyAnimationToActor(baseActor, props);

      expect(result).not.toBe(baseActor);
      expect(result.transform).not.toBe(baseActor.transform);
      expect(result.transform.position).toEqual(newPos);
      expect(result.transform.rotation).toBe(baseActor.transform.rotation);
    });

    it('updates deeply nested properties (properties.color)', () => {
      const props = new Map<string, unknown>([['properties.color', '#ff0000']]);
      const result = applyAnimationToActor(baseActor, props);

      expect(result).not.toBe(baseActor);
      // Cast result to PrimitiveActor to access properties
      const pActor = result as PrimitiveActor;
      expect(pActor.properties).not.toBe(baseActor.properties);
      expect(pActor.properties.color).toBe('#ff0000');
      expect(pActor.properties.roughness).toBe(baseActor.properties.roughness);
    });

    it('handles multiple updates', () => {
      const props = new Map<string, unknown>([
        ['transform.position', [1, 1, 1]],
        ['properties.opacity', 0.5]
      ]);
      const result = applyAnimationToActor(baseActor, props) as PrimitiveActor;

      expect(result.transform.position).toEqual([1, 1, 1]);
      expect(result.properties.opacity).toBe(0.5);
    });

    it('handles array index updates correctly (preserves array type)', () => {
      const props = new Map<string, unknown>([['transform.position.0', 5]]);
      const result = applyAnimationToActor(baseActor, props);

      expect(result.transform.position).toEqual([5, 0, 0]);
      expect(Array.isArray(result.transform.position)).toBe(true);
    });
  });
});
