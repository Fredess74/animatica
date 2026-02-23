// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  getFeatureFlags,
  FeatureFlagProvider,
  useFeatureFlag,
  FeatureFlags
} from './featureFlags';

describe('Feature Flags', () => {
  describe('getFeatureFlags', () => {
    it('returns all true for development', () => {
      const flags = getFeatureFlags('development');
      expect(flags.characters).toBe(true);
      expect(flags.export).toBe(true);
      expect(flags.ai_prompts).toBe(true);
      expect(flags.multiplayer).toBe(true);
      expect(flags.cloud_sync).toBe(true);
    });

    it('returns all false for production by default', () => {
      const flags = getFeatureFlags('production');
      expect(flags.characters).toBe(false);
      expect(flags.export).toBe(false);
      expect(flags.ai_prompts).toBe(false);
      expect(flags.multiplayer).toBe(false);
      expect(flags.cloud_sync).toBe(false);
    });

    it('respects environment variable overrides', () => {
      const mockEnv = {
        VITE_FEATURE_FLAG_CHARACTERS: 'true',
        VITE_FEATURE_FLAG_EXPORT: 'false',
      };

      const flags = getFeatureFlags('production', mockEnv);

      expect(flags.characters).toBe(true); // Overridden to true
      expect(flags.export).toBe(false); // Default false, override false
      expect(flags.multiplayer).toBe(false); // Default false
    });
  });

  describe('FeatureFlagProvider & useFeatureFlag', () => {
    const TestComponent = ({ flag }: { flag: keyof FeatureFlags }) => {
      const isEnabled = useFeatureFlag(flag);
      return <div data-testid="flag-status">{flag}: {isEnabled ? 'ENABLED' : 'DISABLED'}</div>;
    };

    it('allows overriding flags via props', () => {
      render(
        <FeatureFlagProvider initialFlags={{ characters: false, export: true }}>
          <TestComponent flag="characters" />
          <TestComponent flag="export" />
        </FeatureFlagProvider>
      );

      expect(screen.getByText('characters: DISABLED')).toBeDefined();
      expect(screen.getByText('export: ENABLED')).toBeDefined();
    });
  });
});
