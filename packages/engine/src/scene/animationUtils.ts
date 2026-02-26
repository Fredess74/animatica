import { Actor, CameraCut } from '../types';

/**
 * Resolves which camera should be active at a given time based on the camera track.
 * Assumes the camera cuts are sorted by time.
 *
 * @param sortedCuts Array of CameraCut objects, sorted by time.
 * @param currentTime The current playback time in seconds.
 * @returns The ID of the active camera, or null if no cuts exist or time is before first cut.
 */
export function resolveActiveCamera(
    sortedCuts: CameraCut[],
    currentTime: number,
): string | null {
    if (sortedCuts.length === 0) return null;

    // Optimization: Loop backwards since we often want the latest active cut
    for (let i = sortedCuts.length - 1; i >= 0; i--) {
        if (sortedCuts[i].time <= currentTime) {
            return sortedCuts[i].cameraId;
        }
    }

    return null;
}

/**
 * Sets a value deep inside an object structure using a path array,
 * returning a new object with the updated value (copy-on-write).
 *
 * @param obj The source object.
 * @param path Array of property keys (e.g., ['transform', 'position']).
 * @param value The value to set.
 * @returns A new object (or array) with the value set.
 */
export function setDeepValue(obj: any, path: string[], value: any): any {
    if (path.length === 0) return value;

    const [head, ...tail] = path;

    // Handle arrays specifically to preserve Array type
    if (Array.isArray(obj)) {
        const newArr = [...obj];
        const index = Number(head);

        if (!isNaN(index)) {
            // Update numeric index
            newArr[index] = setDeepValue(obj[index], tail, value);
        } else {
            // Update non-numeric property on array (rare, but keeps behavior)
            // e.g. target['x'] on an array
            // Cast to Record to allow string indexing, and obj to any/Record to read
            (newArr as unknown as Record<string, any>)[head] = setDeepValue((obj as any)[head], tail, value);
        }
        return newArr;
    }

    // Handle object (default)
    // If obj is undefined/null, create a new object
    const currentVal = obj ? obj[head] : undefined;

    return {
        ...obj,
        [head]: setDeepValue(currentVal, tail, value)
    };
}

/**
 * Applies interpolated animation values to an actor.
 * Returns a new actor object with the animated properties merged in,
 * or the original actor if no properties are animated.
 *
 * Uses shallow copies (structural sharing) to avoid deep cloning overhead.
 *
 * @param actor The source actor.
 * @param animatedProps Map of property paths (e.g. "transform.position") to values.
 * @returns The actor with updated properties.
 */
export function applyAnimationToActor(
    actor: Actor,
    animatedProps: Map<string, unknown> | undefined,
): Actor {
    if (!animatedProps || animatedProps.size === 0) return actor;

    let newActor = actor;

    for (const [property, value] of animatedProps) {
        const parts = property.split('.');
        newActor = setDeepValue(newActor, parts, value);
    }

    return newActor;
}
