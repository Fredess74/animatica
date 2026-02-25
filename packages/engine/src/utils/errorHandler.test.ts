import { describe, it, expect, vi, afterEach } from 'vitest';
import { AppError, createError, handleError } from './errorHandler';

describe('Error Handler Utility', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create an AppError with context', () => {
        const context = { component: 'TestComponent', action: 'testAction' };
        const error = createError('Test error message', context);

        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error message');
        expect(error.context).toEqual(context);
        expect(error.name).toBe('AppError');
    });

    it('should handle AppError correctly', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const context = { component: 'TestComponent' };
        const error = new AppError('Custom AppError', context);

        handleError(error, { extra: 'data' });

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        const logCall = consoleSpy.mock.calls[0];

        // Message format: [AppError] TIMESTAMP: MESSAGE
        expect(logCall[0]).toContain('[AppError]');
        expect(logCall[0]).toContain('Custom AppError');

        // Context merged
        expect(logCall[1]).toEqual({ component: 'TestComponent', extra: 'data' });
    });

    it('should handle standard Error correctly', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Standard Error');

        handleError(error, { component: 'TestComponent' });

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        const logCall = consoleSpy.mock.calls[0];

        expect(logCall[0]).toContain('[Error]');
        expect(logCall[0]).toContain('Standard Error');
        expect(logCall[1]).toEqual({ component: 'TestComponent' });
    });

    it('should handle unknown error types', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = 'String Error';

        handleError(error, { component: 'TestComponent' });

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        const logCall = consoleSpy.mock.calls[0];

        expect(logCall[0]).toContain('[Unknown Error]');
        expect(logCall[0]).toContain('String Error');
    });
});
