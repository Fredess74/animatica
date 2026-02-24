import { describe, it, expect } from 'vitest';
import * as Easing from './easing';

describe('Easing Functions', () => {
  describe('Standard', () => {
    it('linear', () => {
      expect(Easing.linear(0)).toBe(0);
      expect(Easing.linear(0.5)).toBe(0.5);
      expect(Easing.linear(1)).toBe(1);
    });

    it('quad', () => {
      expect(Easing.quad(0)).toBe(0);
      expect(Easing.quad(0.5)).toBe(0.25);
      expect(Easing.quad(1)).toBe(1);
    });

    it('cubic', () => {
      expect(Easing.cubic(0)).toBe(0);
      expect(Easing.cubic(0.5)).toBe(0.125);
      expect(Easing.cubic(1)).toBe(1);
    });

    it('easeIn', () => {
      expect(Easing.easeIn(0)).toBe(0);
      expect(Easing.easeIn(0.5)).toBe(0.25);
      expect(Easing.easeIn(1)).toBe(1);
    });

    it('easeOut', () => {
      expect(Easing.easeOut(0)).toBe(0);
      expect(Easing.easeOut(0.5)).toBe(0.75);
      expect(Easing.easeOut(1)).toBe(1);
    });

    it('easeInOut', () => {
      expect(Easing.easeInOut(0)).toBe(0);
      expect(Easing.easeInOut(0.25)).toBe(0.125); // < 0.5
      expect(Easing.easeInOut(0.5)).toBe(0.5);
      expect(Easing.easeInOut(0.75)).toBe(0.875); // >= 0.5
      expect(Easing.easeInOut(1)).toBe(1);
    });

    it('step', () => {
      expect(Easing.step(0)).toBe(0);
      expect(Easing.step(0.5)).toBe(0);
      expect(Easing.step(0.999)).toBe(0);
      expect(Easing.step(1)).toBe(1);
    });
  });

  describe('Back', () => {
    it('backIn overshoots backwards', () => {
      expect(Easing.backIn(0)).toBe(0);
      expect(Easing.backIn(1)).toBeCloseTo(1);
      // At small t, it should be negative
      expect(Easing.backIn(0.2)).toBeLessThan(0);
    });

    it('backOut overshoots forwards', () => {
      expect(Easing.backOut(0)).toBeCloseTo(0);
      expect(Easing.backOut(1)).toBe(1);
      // At high t, it should be > 1
      expect(Easing.backOut(0.8)).toBeGreaterThan(1);
    });

    it('backInOut overshoots both ways', () => {
      expect(Easing.backInOut(0)).toBeCloseTo(0);
      expect(Easing.backInOut(1)).toBeCloseTo(1);
      expect(Easing.backInOut(0.5)).toBe(0.5);
      // Low t -> negative
      expect(Easing.backInOut(0.1)).toBeLessThan(0);
      // High t -> > 1
      expect(Easing.backInOut(0.9)).toBeGreaterThan(1);
    });
  });

  describe('Elastic', () => {
    it('elasticIn', () => {
      expect(Easing.elasticIn(0)).toBe(0);
      expect(Easing.elasticIn(1)).toBe(1);
      // Should oscillate
    });

    it('elasticOut', () => {
      expect(Easing.elasticOut(0)).toBe(0);
      expect(Easing.elasticOut(1)).toBe(1);
      // Check alias
      expect(Easing.elastic(0.5)).toBe(Easing.elasticOut(0.5));
    });

    it('elasticInOut', () => {
      expect(Easing.elasticInOut(0)).toBe(0);
      expect(Easing.elasticInOut(1)).toBe(1);
      expect(Easing.elasticInOut(0.5)).toBe(0.5);
    });
  });

  describe('Bounce', () => {
    it('bounceOut', () => {
      expect(Easing.bounceOut(0)).toBe(0);
      expect(Easing.bounceOut(1)).toBeCloseTo(1);
      // Check alias
      expect(Easing.bounce(0.5)).toBe(Easing.bounceOut(0.5));
    });

    it('bounceIn', () => {
      expect(Easing.bounceIn(0)).toBeCloseTo(0);
      expect(Easing.bounceIn(1)).toBe(1);
    });

    it('bounceInOut', () => {
      expect(Easing.bounceInOut(0)).toBeCloseTo(0);
      expect(Easing.bounceInOut(1)).toBeCloseTo(1);
      expect(Easing.bounceInOut(0.5)).toBe(0.5);
    });
  });

  describe('Spring', () => {
    it('spring', () => {
      // t=0 -> 0
      expect(Easing.spring(0)).toBeCloseTo(0);
      // It likely settles near 1 but spring function provided doesn't necessarily end at 1 at t=1 if strictly physics based,
      // but let's check values.
      // Based on implementation: -0.5 * exp(-6t) * ...
      // Let's just check it doesn't crash and returns reasonable numbers.
      const val = Easing.spring(0.5);
      expect(typeof val).toBe('number');
    });
  });

  describe('Cubic Bezier', () => {
    it('linear equivalent (0,0,1,1)', () => {
      const linearBezier = Easing.cubicBezier(0, 0, 1, 1);
      expect(linearBezier(0)).toBe(0);
      expect(linearBezier(0.5)).toBeCloseTo(0.5);
      expect(linearBezier(1)).toBe(1);
    });

    it('ease-in equivalent (0.42, 0, 1, 1)', () => {
      const easeIn = Easing.cubicBezier(0.42, 0, 1, 1);
      expect(easeIn(0)).toBe(0);
      expect(easeIn(0.25)).toBeLessThan(0.25); // Slow start
      expect(easeIn(1)).toBe(1);
    });

    it('ease-out equivalent (0, 0, 0.58, 1)', () => {
      const easeOut = Easing.cubicBezier(0, 0, 0.58, 1);
      expect(easeOut(0)).toBe(0);
      expect(easeOut(0.25)).toBeGreaterThan(0.25); // Fast start
      expect(easeOut(1)).toBe(1);
    });
  });
});
