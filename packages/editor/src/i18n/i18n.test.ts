// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTranslation } from './useTranslation'

describe('useTranslation', () => {
  it('translates simple keys', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('timeline.stop')).toBe('Stop')
  })

  it('translates nested keys', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('timeline.duration')).toBe('Duration')
  })

  it('interpolates values', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('timeline.seconds', { count: 5 })).toBe('5s')
  })

  it('returns key for missing translation', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('missing.key')).toBe('missing.key')
  })

  it('handles multiple interpolations', () => {
    const { result } = renderHook(() => useTranslation())
    // "Starting {{resolution}} @ {{fps}}fps export..."
    expect(result.current.t('export.starting', { resolution: '1080p', fps: 60 })).toBe(
      'Starting 1080p @ 60fps export...'
    )
  })
})
