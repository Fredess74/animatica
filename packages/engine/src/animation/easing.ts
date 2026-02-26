/**
 * Easing functions library for animation interpolation.
 * All functions accept a normalized time 't' (0 to 1) and return an eased value.
 * While 't' is typically 0-1, it can be outside this range (e.g. for elastic/bounce).
 *
 * @module @animatica/engine/animation/easing
 */

/**
 * Linear interpolation (no easing).
 * @param t Normalized time (0-1).
 * @returns The linear value (same as t).
 */
export const linear = (t: number): number => t;

/**
 * Quadratic ease-in.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const quad = (t: number): number => t * t;

/**
 * Cubic ease-in.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const cubic = (t: number): number => t * t * t;

/**
 * Alias for quadratic ease-in.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const easeIn = (t: number): number => quad(t);

/**
 * Quadratic ease-out.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 2);

/**
 * Quadratic ease-in-out.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

/**
 * Bounce effect easing.
 * @param t Normalized time (0-1).
 * @returns Eased value with bounce effect.
 */
export const bounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

/**
 * Elastic effect easing.
 * @param t Normalized time (0-1).
 * @returns Eased value with elastic effect.
 */
export const elastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Spring effect easing (gentler than elastic).
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const spring = (t: number): number => {
  return 1 - Math.cos(t * 4.5 * Math.PI) * Math.exp(-t * 6);
};

/**
 * Back ease-in.
 * Retracts the motion before shooting to the target.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const backIn = (t: number): number => {
  const s = 1.70158;
  return t * t * ((s + 1) * t - s);
};

/**
 * Back ease-out.
 * Overshoots the target before retracting.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const backOut = (t: number): number => {
  const s = 1.70158;
  return --t * t * ((s + 1) * t + s) + 1;
};

/**
 * Back ease-in-out.
 * Retracts, then overshoots.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const backInOut = (t: number): number => {
  const s = 1.70158 * 1.525;
  if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
  return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
};

/**
 * Step function (returns 0 if t < 1, else 1).
 * Used for instant value changes without interpolation.
 * @param t Normalized time (0-1).
 * @returns 0 or 1.
 */
export const step = (t: number): number => {
  return t < 1 ? 0 : 1;
};
