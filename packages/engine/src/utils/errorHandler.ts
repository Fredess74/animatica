/**
 * Error handling utilities for the Animatica engine.
 * Provides a standardized error class and logging mechanism.
 *
 * @module @animatica/engine/utils/errorHandler
 */

/**
 * Custom error class for engine-specific errors.
 */
export class EngineError extends Error {
    public readonly code: string;
    public readonly context?: Record<string, unknown>;

    constructor(message: string, code: string = 'UNKNOWN_ERROR', context?: Record<string, unknown>) {
        super(message);
        this.name = 'EngineError';
        this.code = code;
        this.context = context;

        // Restore prototype chain for instanceof checks
        Object.setPrototypeOf(this, EngineError.prototype);
    }
}

/**
 * Logs an error to the console with additional context.
 * In a production environment, this could be replaced with a service like Sentry.
 *
 * @param error The error to log.
 * @param context Additional context string or object.
 */
export function logError(error: unknown, context?: string | Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[Animatica Engine Error] ${timestamp}`);
    if (context) {
        console.error('Context:', context);
    }
    console.error('Message:', errorMessage);
    if (errorStack) {
        console.error('Stack:', errorStack);
    }
}

/**
 * Wraps an asynchronous function with a try/catch block that logs errors.
 * Re-throws the error after logging.
 *
 * @param fn The async function to execute.
 * @param context Context string for logging.
 * @returns The result of the async function.
 * @throws The original error.
 */
export async function wrapAsync<T>(
    fn: () => Promise<T>,
    context: string = 'Async Operation'
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        logError(error, context);
        throw error;
    }
}

/**
 * Safe version of wrapAsync that returns null instead of throwing.
 *
 * @param fn The async function to execute.
 * @param context Context string for logging.
 * @returns The result of the async function or null if it failed.
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    context: string = 'Safe Async Operation'
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        logError(error, context);
        return null;
    }
}
