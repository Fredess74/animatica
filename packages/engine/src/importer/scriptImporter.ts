import type { ValidationResult } from '../types/index.js';
import { ProjectStateSchema } from './schemas/project.js';

/**
 * Validates and imports a JSON script into the internal ProjectState format.
 *
 * @param json - The raw JSON object to import (parsed from string or object literal)
 * @returns ValidationResult containing the parsed data or error messages
 */
export function importScript(json: unknown): ValidationResult {
  const result = ProjectStateSchema.safeParse(json);

  if (result.success) {
    return {
      success: true,
      errors: [],
      data: result.data,
    };
  } else {
    // Format Zod errors into readable strings
    // Zod v4 uses .issues instead of .errors apparently? Or maybe it's just this build.
    // We try both for compatibility.
    const issues = (result.error as any).issues || (result.error as any).errors || [];
    const errors = issues.map((issue: any) => {
      const path = issue.path.join('.');
      return `${path}: ${issue.message}`;
    });

    return {
      success: false,
      errors,
    };
  }
}

/**
 * Validates a JSON string directly.
 *
 * @param jsonString - The JSON string to parse and validate
 * @returns ValidationResult
 */
export function importScriptFromString(jsonString: string): ValidationResult {
  try {
    const json = JSON.parse(jsonString);
    return importScript(json);
  } catch (error) {
    return {
      success: false,
      errors: [`JSON Parse Error: ${(error as Error).message}`],
    };
  }
}
