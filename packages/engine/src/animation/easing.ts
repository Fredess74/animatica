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
 * Step function (returns 0 if t < 1, else 1).
 * Used for instant value changes without interpolation.
 * @param t Normalized time (0-1).
 * @returns 0 or 1.
 */
export const step = (t: number): number => (t < 1 ? 0 : 1);

// ---- Quad ----

/**
 * Quadratic ease-in.
 */
export const quadIn = (t: number): number => t * t;

/**
 * Quadratic ease-out.
 */
export const quadOut = (t: number): number => 1 - (1 - t) * (1 - t);

/**
 * Quadratic ease-in-out.
 */
export const quadInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// Aliases for standard easing names
export const easeIn = quadIn;
export const easeOut = quadOut;
export const easeInOut = quadInOut;

// Legacy/Auxiliary
export const quad = quadIn;
export const cubic = (t: number): number => t * t * t;

// ---- Bounce ----

/**
 * Bounce ease-out.
 */
export const bounceOut = (t: number): number => {
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
 * Bounce ease-in.
 */
export const bounceIn = (t: number): number => 1 - bounceOut(1 - t);

/**
 * Bounce ease-in-out.
 */
export const bounceInOut = (t: number): number =>
  t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2;

export const bounce = bounceOut;

// ---- Elastic ----

/**
 * Elastic ease-out.
 */
export const elasticOut = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Elastic ease-in.
 */
export const elasticIn = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

/**
 * Elastic ease-in-out.
 */
export const elasticInOut = (t: number): number => {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

export const elastic = elasticOut;

// ---- Back ----

/**
 * Back ease-in.
 */
export const backIn = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

/**
 * Back ease-out.
 */
export const backOut = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Back ease-in-out.
 */
export const backInOut = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (2 * t - 2) + c2) + 2) / 2;
};
