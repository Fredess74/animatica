// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTranslation } from './useTranslation';

describe('useTranslation', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useTranslation());
        act(() => {
            result.current.i18n.changeLanguage('en');
        });
    });

    it('translates simple keys', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('timeline.stop')).toBe('Stop');
    });

    it('translates nested keys', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('timeline.duration')).toBe('Duration');
    });

    it('interpolates values', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('timeline.seconds', { count: 5 })).toBe('5s');
    });

    it('returns key for missing translation', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('missing.key')).toBe('missing.key');
    });

    it('handles multiple interpolations', () => {
        const { result } = renderHook(() => useTranslation());
        // "Starting {{resolution}} @ {{fps}}fps export..."
        expect(result.current.t('export.starting', { resolution: '1080p', fps: 60 })).toBe('Starting 1080p @ 60fps export...');
    });

    it('switches language to Russian', () => {
        const { result } = renderHook(() => useTranslation());

        act(() => {
            result.current.i18n.changeLanguage('ru');
        });

        expect(result.current.i18n.language).toBe('ru');
        expect(result.current.t('timeline.stop')).toBe('Стоп');
        expect(result.current.t('properties.title')).toBe('Свойства');
    });

    it('verifies properties keys exist in English', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('properties.title')).toBe('Properties');
        expect(result.current.t('properties.sections.general')).toBe('General');
    });

    it('updates all hooks when language changes', () => {
        const hook1 = renderHook(() => useTranslation());
        const hook2 = renderHook(() => useTranslation());

        act(() => {
            hook1.result.current.i18n.changeLanguage('ru');
        });

        expect(hook1.result.current.i18n.language).toBe('ru');
        expect(hook2.result.current.i18n.language).toBe('ru');

        expect(hook1.result.current.t('timeline.stop')).toBe('Стоп');
        expect(hook2.result.current.t('timeline.stop')).toBe('Стоп');
    });
});
