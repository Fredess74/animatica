/**
 * JSON Scene Importer — parses, validates, and imports scene scripts.
 * Supports reading from raw JSON strings or JSON files.
 *
 * @module @animatica/engine/importer
 */
import { ProjectStateSchema } from '../schemas/scene.schema';
import type { ProjectState, ValidationResult } from '../types';

export const MAX_SCRIPT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates a JSON string against the project schema.
 * It gracefully handles common issues like:
 * - Nested "project" keys (often returned by LLMs).
 * - Extra whitespace.
 *
 * @param jsonString The raw JSON string to validate.
 * @returns An object describing whether validation succeeded, with errors or the parsed data.
 *
 * @example
 * const result = validateScript('{"meta": ...}');
 * if (!result.success) {
 *   console.error(result.errors);
 * }
 */
export function validateScript(jsonString: string): ValidationResult {
    // Step 0: Check size limit to prevent DoS
    if (jsonString.length > MAX_SCRIPT_SIZE) {
        return {
            success: false,
            errors: [`Script too large (max ${MAX_SCRIPT_SIZE / 1024 / 1024}MB)`],
        };
    }

    // Step 1: Parse JSON
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonString);
    } catch (e) {
        return {
            success: false,
            errors: [`Invalid JSON: ${(e as Error).message}`],
        };
    }

    // Step 2: Check for nested "project" wrapper (common AI output format)
    if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'project' in parsed &&
        !('meta' in parsed)
    ) {
        // Narrow type safely
        parsed = (parsed as { project: unknown }).project;
    }

    // Step 3: Validate against Zod schema
    const result = ProjectStateSchema.safeParse(parsed);

    if (result.success) {
        return {
            success: true,
            errors: [],
            data: result.data as ProjectState,
        };
    }

    // Step 4: Collect human-readable errors
    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
    });

    return {
        success: false,
        errors,
    };
}

/**
 * Imports a scene script, throwing an error if validation fails.
 * This is the strict version of `tryImportScript`.
 *
 * @param jsonString The raw JSON string to import.
 * @returns The fully validated `ProjectState` object ready for the store.
 * @throws {Error} If the script is invalid, with a newline-separated list of issues.
 *
 * @example
 * try {
 *   const project = importScript(userInput);
 *   loadProject(project);
 * } catch (err) {
 *   alert(err.message);
 * }
 */
export function importScript(jsonString: string): ProjectState {
    const result = validateScript(jsonString);
    if (!result.success || !result.data) {
        throw new Error(
            `Scene import failed:\n${result.errors.map((e) => `  • ${e}`).join('\n')}`,
        );
    }
    return result.data;
}

/**
 * Attempts to import a script without throwing exceptions.
 * Useful for real-time validation in UI forms (e.g., checking paste events).
 *
 * @param jsonString The raw JSON string.
 * @returns A result object with either `data` (ProjectState) or `errors` (string[]).
 */
export function tryImportScript(
    jsonString: string,
): { ok: true; data: ProjectState } | { ok: false; errors: string[] } {
    const result = validateScript(jsonString);
    if (result.success && result.data) {
        return { ok: true, data: result.data };
    }
    return { ok: false, errors: result.errors };
}
