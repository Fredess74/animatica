// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  getFeatureFlags,
  FeatureFlagProvider,
  useFeatureFlag,
  FeatureFlags
} from './featureFlags';

describe('Feature Flags', () => {
  describe('getFeatureFlags', () => {
    it('returns all true for development', () => {
      // Mock empty environment
      const flags = getFeatureFlags('development', {});
      expect(flags.characters).toBe(true);
      expect(flags.export).toBe(true);
      expect(flags.aiPrompts).toBe(true);
      expect(flags.multiplayer).toBe(true);
      expect(flags.cloudSync).toBe(true);
    });

    it('returns all false for production by default', () => {
      // Mock empty environment
      const flags = getFeatureFlags('production', {});
      expect(flags.characters).toBe(false);
      expect(flags.export).toBe(false);
      expect(flags.aiPrompts).toBe(false);
      expect(flags.multiplayer).toBe(false);
      expect(flags.cloudSync).toBe(false);
    });

    it('respects environment variable overrides', () => {
      const mockEnv = {
        VITE_FEATURE_FLAG_CHARACTERS: 'true',
        VITE_FEATURE_FLAG_EXPORT: 'false',
        VITE_FEATURE_FLAG_AI_PROMPTS: 'true',
      };

      const flags = getFeatureFlags('production', mockEnv);

      expect(flags.characters).toBe(true); // Overridden to true
      expect(flags.export).toBe(false); // Default false, override false
      expect(flags.aiPrompts).toBe(true); // Overridden to true
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

    it('handles renamed flags (aiPrompts, cloudSync) correctly', () => {
       render(
        <FeatureFlagProvider initialFlags={{ aiPrompts: true, cloudSync: false }}>
          <TestComponent flag="aiPrompts" />
          <TestComponent flag="cloudSync" />
        </FeatureFlagProvider>
      );

      expect(screen.getByText('aiPrompts: ENABLED')).toBeDefined();
      expect(screen.getByText('cloudSync: DISABLED')).toBeDefined();
    });
  });
});
