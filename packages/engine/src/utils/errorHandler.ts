/**
 * Error Handler Utility
 * Provides centralized error logging and handling for the application.
 *
 * @module @animatica/engine/utils/errorHandler
 */

export interface ErrorContext {
    component?: string;
    action?: string;
    actorId?: string;
    [key: string]: unknown;
}

/**
 * Custom Error class with additional context.
 */
export class AppError extends Error {
    public context: ErrorContext;
    public timestamp: number;

    constructor(message: string, context: ErrorContext = {}) {
        super(message);
        this.name = 'AppError';
        this.context = context;
        this.timestamp = Date.now();

        // Restore prototype chain for instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Creates a new AppError with context.
 * @param message Error message
 * @param context Additional context about where/why the error occurred
 */
export function createError(message: string, context: ErrorContext = {}): AppError {
    return new AppError(message, context);
}

/**
 * Centralized error handler.
 * Logs errors to console and can be extended to report to external services.
 * @param error The error object (can be unknown)
 * @param context Additional context to merge with existing error context
 */
export function handleError(error: unknown, context: ErrorContext = {}): void {
    const timestamp = new Date().toISOString();
    let message = 'Unknown Error';
    let errorContext = { ...context };

    if (error instanceof AppError) {
        message = error.message;
        errorContext = { ...error.context, ...context };
        console.error(`[AppError] ${timestamp}: ${message}`, errorContext);
    } else if (error instanceof Error) {
        message = error.message;
        console.error(`[Error] ${timestamp}: ${message}`, errorContext, error.stack);
    } else {
        message = String(error);
        console.error(`[Unknown Error] ${timestamp}: ${message}`, errorContext);
    }

    // Future: Report to Sentry or other monitoring service
    // reportToService({ message, context: errorContext, originalError: error });
}
