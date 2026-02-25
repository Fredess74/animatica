import { describe, it, expect } from 'vitest';
import * as Easing from './easing';

describe('Easing Functions', () => {
  it('linear', () => {
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(1)).toBe(1);
  });

  it('step', () => {
    expect(Easing.step(0)).toBe(0);
    expect(Easing.step(0.5)).toBe(0);
    expect(Easing.step(0.999)).toBe(0);
    expect(Easing.step(1)).toBe(1);
  });

  // ---- Quad ----
  it('quadIn', () => {
    expect(Easing.quadIn(0)).toBe(0);
    expect(Easing.quadIn(0.5)).toBe(0.25);
    expect(Easing.quadIn(1)).toBe(1);
  });

  it('quadOut', () => {
    expect(Easing.quadOut(0)).toBe(0);
    expect(Easing.quadOut(0.5)).toBe(0.75);
    expect(Easing.quadOut(1)).toBe(1);
  });

  it('quadInOut', () => {
    expect(Easing.quadInOut(0)).toBe(0);
    expect(Easing.quadInOut(0.25)).toBe(0.125);
    expect(Easing.quadInOut(0.5)).toBe(0.5);
    expect(Easing.quadInOut(0.75)).toBe(0.875);
    expect(Easing.quadInOut(1)).toBe(1);
  });

  // ---- Bounce ----
  it('bounceOut', () => {
    expect(Easing.bounceOut(0)).toBe(0);
    expect(Easing.bounceOut(1)).toBeCloseTo(1);

    // Check specific value logic roughly
    // t=0.1 (branch 1)
    expect(Easing.bounceOut(0.1)).toBeCloseTo(7.5625 * 0.1 * 0.1);
  });

  it('bounceIn', () => {
    expect(Easing.bounceIn(0)).toBe(0);
    expect(Easing.bounceIn(1)).toBeCloseTo(1);
    // bounceIn(0.9) should match 1 - bounceOut(0.1)
    expect(Easing.bounceIn(0.9)).toBeCloseTo(1 - Easing.bounceOut(0.1));
  });

  it('bounceInOut', () => {
    expect(Easing.bounceInOut(0)).toBe(0);
    expect(Easing.bounceInOut(0.5)).toBe(0.5);
    expect(Easing.bounceInOut(1)).toBeCloseTo(1);
  });

  // ---- Elastic ----
  it('elasticOut', () => {
    expect(Easing.elasticOut(0)).toBe(0);
    expect(Easing.elasticOut(1)).toBe(1);
    // Should overshoot 1 slightly around t=0.4
    expect(Easing.elasticOut(0.4)).toBeGreaterThan(1);
  });

  it('elasticIn', () => {
    expect(Easing.elasticIn(0)).toBe(0);
    expect(Easing.elasticIn(1)).toBe(1);
    // Should undershoot 0 slightly around t=0.6
    expect(Easing.elasticIn(0.6)).toBeLessThan(0);
  });

  it('elasticInOut', () => {
    expect(Easing.elasticInOut(0)).toBe(0);
    expect(Easing.elasticInOut(0.5)).toBe(0.5);
    expect(Easing.elasticInOut(1)).toBe(1);
  });

  // ---- Back ----
  it('backIn', () => {
    expect(Easing.backIn(0)).toBeCloseTo(0);
    expect(Easing.backIn(1)).toBeCloseTo(1);
    // Should go below 0 initially
    expect(Easing.backIn(0.25)).toBeLessThan(0);
  });

  it('backOut', () => {
    expect(Easing.backOut(0)).toBeCloseTo(0);
    expect(Easing.backOut(1)).toBeCloseTo(1);
    // Should go above 1 initially (well, at the end actually, it overshoots)
    expect(Easing.backOut(0.75)).toBeGreaterThan(1);
  });

  it('backInOut', () => {
    expect(Easing.backInOut(0)).toBeCloseTo(0);
    expect(Easing.backInOut(0.5)).toBe(0.5);
    expect(Easing.backInOut(1)).toBeCloseTo(1);
  });

  // ---- Aliases ----
  it('aliases work', () => {
      expect(Easing.easeIn).toBe(Easing.quadIn);
      expect(Easing.easeOut).toBe(Easing.quadOut);
      expect(Easing.easeInOut).toBe(Easing.quadInOut);
      expect(Easing.bounce).toBe(Easing.bounceOut);
      expect(Easing.elastic).toBe(Easing.elasticOut);
      // Legacy
      expect(Easing.quad).toBe(Easing.quadIn);
  });
});
