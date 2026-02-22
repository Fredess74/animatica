/**
 * JSON Scene Importer — parses, validates, and imports scene scripts.
 * Supports reading from raw JSON strings or JSON files.
 *
 * @module @animatica/engine/importer
 */
import { ProjectStateSchema } from '../schemas/scene.schema';
import type { ProjectState, ValidationResult } from '../types';

/**
 * Result of a JSON parse operation.
 */
type ParseResult =
  | { success: true; data: unknown }
  | { success: false; error: string };

/**
 * Safely parses a JSON string.
 */
function safeParseJSON(jsonString: string): ParseResult {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (e) {
    return {
      success: false,
      error: `Invalid JSON: ${(e as Error).message}`,
    };
  }
}

/**
 * Type guard for the AI wrapper format { project: ... }
 */
function isWrappedProject(data: unknown): data is { project: unknown } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'project' in data &&
    !('meta' in data) // Ensure it's not a ProjectState that happens to have a 'project' field (though unlikely given schema)
  );
}

/**
 * Unwraps the project data if it's nested inside a "project" property.
 * This handles the common AI output format where the JSON is wrapped in { "project": ... }
 */
function unwrapProjectData(data: unknown): unknown {
  if (isWrappedProject(data)) {
    return data.project;
  }
  return data;
}

/**
 * Validate a raw JSON string against the ProjectState schema.
 * Returns a ValidationResult with parsed data or detailed error messages.
 */
export function validateScript(jsonString: string): ValidationResult {
  // Step 1: Parse JSON
  const parseResult = safeParseJSON(jsonString);
  if (!parseResult.success) {
    return {
      success: false,
      errors: [parseResult.error],
    };
  }

  // Step 2: Unwrap project data if necessary
  const data = unwrapProjectData(parseResult.data);

  // Step 3: Validate against Zod schema
  const result = ProjectStateSchema.safeParse(data);

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
 * Import a scene script. Validates and returns the ProjectState.
 * Throws if validation fails.
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
 * Try to import a script, returning the result without throwing.
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
