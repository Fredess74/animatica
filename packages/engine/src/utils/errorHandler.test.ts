import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleError } from './errorHandler';

describe('errorHandler', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    afterEach(() => {
        consoleSpy.mockClear();
    });

    it('should log error with minimal context', () => {
        const error = new Error('Test error');
        handleError(error);

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Animatica Error] [Unknown] Test error'),
            expect.objectContaining({
                message: 'Test error',
                timestamp: expect.any(String),
                stack: expect.any(String)
            })
        );
    });

    it('should log error with full context', () => {
        const error = new Error('Context error');
        const context = {
            component: 'TestComponent',
            actorId: '123',
            action: 'testAction',
            meta: { foo: 'bar' }
        };

        handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Animatica Error] [TestComponent] Context error'),
            expect.objectContaining({
                message: 'Context error',
                ...context
            })
        );
    });

    it('should handle non-Error objects', () => {
        handleError('String error');

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Animatica Error] [Unknown] String error'),
            expect.objectContaining({
                message: 'String error',
                stack: undefined
            })
        );
    });
});
