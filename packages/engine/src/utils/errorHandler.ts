/**
 * Error handling utility for the engine.
 * Provides a centralized way to log errors and contextual information.
 *
 * @module @animatica/engine/utils/errorHandler
 */

/**
 * Contextual information about where an error occurred.
 */
export interface ErrorContext {
    /** The name of the component or module where the error happened. */
    component?: string;
    /** The ID of the actor involved, if any. */
    actorId?: string;
    /** The action or operation being performed. */
    action?: string;
    /** Any additional metadata. */
    meta?: Record<string, unknown>;
}

/**
 * Handles an error by logging it to the console with structured context.
 * In the future, this could be extended to report to an external service (e.g., Sentry).
 *
 * @param error The error object or message.
 * @param context Additional context about the error.
 */
export function handleError(error: unknown, context: ErrorContext = {}): void {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logPayload = {
        timestamp,
        message: errorMessage,
        stack: errorStack,
        ...context,
    };

    console.error(`[Animatica Error] [${context.component || 'Unknown'}] ${errorMessage}`, logPayload);
}
